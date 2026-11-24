import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calculateRainfallVolume, SOIL_CHARACTERISTICS, SLOPE_MODIFIERS } from '../../src/modules/simulation/engine/rainfallModel.js';
import { calculateRecharge, INTERVENTION_SPECIFICATIONS } from '../../src/modules/simulation/engine/rechargeModel.js';
import { calculateExtraction, CROP_WATER_REQUIREMENTS, IRRIGATION_EFFICIENCIES } from '../../src/modules/simulation/engine/extractionModel.js';
import { calculateAquiferState, WATER_TABLE_CATEGORIES } from '../../src/modules/simulation/engine/aquiferModel.js';
import { calculateWaterQuality, WQI_CATEGORIES } from '../../src/modules/simulation/engine/waterQualityModel.js';
import { calculateSustainabilityScore } from '../../src/modules/simulation/engine/sustainabilityModel.js';
import { getScenarioList, getScenarioById, SIMULATION_SCENARIOS } from '../../src/modules/simulation/engine/scenarioEngine.js';
import { runSimulationEngine } from '../../src/modules/simulation/engine/waterBalance.js';

describe('Phase 7: Scientific Groundwater Simulation Engine Unit Tests', () => {

  describe('1. Rainfall and Precipitation Model', () => {
    it('should correctly calculate volumetric rainfall from depth and area', () => {
      // 100 mm rain over 1,000,000 m2 (100 ha) = (100 * 1000000) / 1000 = 100,000 m3
      const result = calculateRainfallVolume({
        rainfallMm: 100,
        catchmentAreaM2: 1000000,
        soilType: 'HARD_ROCK',
        slope: 'MODERATE'
      });

      assert.equal(result.totalVolumeM3, 100000);
      assert.equal(result.catchmentAreaHectares, 100);
    });

    it('should enforce strict conservation of mass (Runoff + Infiltration + Evaporation = Total)', () => {
      const result = calculateRainfallVolume({
        rainfallMm: 750,
        catchmentAreaM2: 5000000,
        soilType: 'ALLUVIAL',
        slope: 'FLAT'
      });

      const sumOfPartitions = result.runoffVolumeM3 + result.infiltrationVolumeM3 + result.evaporativeLossesM3;
      // Allow minor floating point rounding within 0.1 m3
      assert.ok(Math.abs(sumOfPartitions - result.totalVolumeM3) < 0.1);
    });

    it('should reject negative rainfall depth or invalid catchment area', () => {
      assert.throws(() => {
        calculateRainfallVolume({ rainfallMm: -50, catchmentAreaM2: 1000000 });
      });
      assert.throws(() => {
        calculateRainfallVolume({ rainfallMm: 100, catchmentAreaM2: 0 });
      });
    });
  });

  describe('2. Groundwater Recharge Model', () => {
    it('should calculate natural recharge from deep percolation', () => {
      const result = calculateRecharge({
        infiltrationVolumeM3: 50000,
        runoffVolumeM3: 30000,
        deepPercolationFraction: 0.50
      });

      assert.equal(result.naturalRechargeM3, 25000);
      assert.equal(result.soilMoistureRetainedM3, 25000);
      assert.equal(result.artificialRechargeM3, 0);
      assert.equal(result.totalRechargeM3, 25000);
    });

    it('should boost recharge through check dams and percolation tanks without exceeding runoff', () => {
      const result = calculateRecharge({
        infiltrationVolumeM3: 40000,
        runoffVolumeM3: 50000,
        interventions: {
          checkDamsCount: 2, // 2 * 6000 = 12000 capacity @ 75% = 9000
          percolationTanksCount: 1 // 1 * 25000 = 25000 capacity @ 80% = 20000
        }
      });

      assert.ok(result.artificialRechargeM3 > 0);
      assert.ok(result.totalRechargeM3 > result.naturalRechargeM3);
      assert.equal(result.runoffCapturedM3, 37000); // 12000 + 25000 = 37000 <= 50000 runoff
      assert.equal(result.uncapturedRunoffM3, 13000);
    });

    it('should cap runoff capture at available surface runoff volume', () => {
      const result = calculateRecharge({
        infiltrationVolumeM3: 10000,
        runoffVolumeM3: 5000, // Only 5,000 m3 available
        interventions: {
          percolationTanksCount: 2 // 50,000 m3 potential capacity
        }
      });

      assert.equal(result.runoffCapturedM3, 5000);
      assert.equal(result.uncapturedRunoffM3, 0);
    });
  });

  describe('3. Groundwater Extraction Model', () => {
    it('should compute domestic consumption accurately per Jal Jeevan Mission LPCD standards', () => {
      // 4000 people * 55 LPCD * 90 days = 19,800,000 Liters = 19,800 m3
      const result = calculateExtraction({
        crops: [],
        population: 4000,
        perCapitaLpcd: 55,
        simulationDays: 90
      });

      assert.equal(result.domesticExtractionM3, 19800);
      assert.equal(result.agriculturalExtractionM3, 0);
      assert.equal(result.totalExtractionM3, 19800);
    });

    it('should compute agricultural draft for crops and apply drip irrigation savings', () => {
      const floodResult = calculateExtraction({
        crops: [{ crop: 'WHEAT', hectares: 10 }], // 10 ha * 4500 m3 = 45,000 m3
        irrigationMethod: 'FLOOD'
      });

      const dripResult = calculateExtraction({
        crops: [{ crop: 'WHEAT', hectares: 10 }],
        irrigationMethod: 'DRIP' // 48% water savings
      });

      assert.equal(floodResult.agriculturalExtractionM3, 45000);
      assert.equal(dripResult.agriculturalExtractionM3, 23400); // 45000 * (1 - 0.48) = 23,400
      assert.equal(dripResult.waterSavingsM3, 21600);
    });
  });

  describe('4. Aquifer Storage & Boundary Checking Model', () => {
    it('should correctly calculate safe water table storage transition', () => {
      const state = calculateAquiferState({
        initialStorageM3: 500000,
        maxCapacityM3: 1000000,
        rechargeM3: 150000,
        extractionM3: 100000,
        naturalDischargeCoeff: 0.02 // 10,000 m3 baseflow
      });

      // 500,000 + 150,000 - 100,000 - 10,000 = 540,000 m3 (54%)
      assert.equal(state.finalStorageM3, 540000);
      assert.equal(state.storagePercentage, 54);
      assert.equal(state.conditionCategory, 'SAFE');
      assert.equal(state.rejectedRechargeM3, 0);
      assert.equal(state.unmetDeficitM3, 0);
    });

    it('should prevent negative storage and compute unmet deficit on exhaustion', () => {
      const state = calculateAquiferState({
        initialStorageM3: 50000,
        maxCapacityM3: 1000000,
        rechargeM3: 10000,
        extractionM3: 200000, // Massive overdraft
        naturalDischargeCoeff: 0.02
      });

      assert.equal(state.finalStorageM3, 0);
      assert.equal(state.storagePercentage, 0);
      assert.equal(state.conditionCategory, 'CRITICAL');
      assert.ok(state.unmetDeficitM3 > 0);
    });

    it('should clamp storage to maximum capacity and reject excess overflow', () => {
      const state = calculateAquiferState({
        initialStorageM3: 900000,
        maxCapacityM3: 1000000,
        rechargeM3: 300000,
        extractionM3: 20000,
        naturalDischargeCoeff: 0.01
      });

      assert.equal(state.finalStorageM3, 1000000);
      assert.equal(state.storagePercentage, 100);
      assert.equal(state.conditionCategory, 'OPTIMAL');
      assert.ok(state.rejectedRechargeM3 > 0);
    });
  });

  describe('5. Water Quality Index (WQI) Model', () => {
    it('should improve WQI with dilution, organic practices, and bio-filters', () => {
      const result = calculateWaterQuality({
        initialWQI: 70,
        rechargeM3: 250000,
        finalStorageM3: 600000,
        maxCapacityM3: 1000000,
        chemicalIntensity: 'LOW',
        wastewaterManagement: 'SOAK_PITS',
        organicFarming: true,
        bioFiltersActive: true
      });

      assert.ok(result.finalWQI > 70);
      assert.ok(result.netChange > 0);
      assert.ok(result.disclaimer.includes('educational index'));
    });

    it('should degrade WQI under severe drawdown and high chemical intensity', () => {
      const result = calculateWaterQuality({
        initialWQI: 65,
        rechargeM3: 5000,
        finalStorageM3: 50000, // 5% of 1,000,000 capacity -> triggers deep drawdown penalty
        maxCapacityM3: 1000000,
        chemicalIntensity: 'HIGH',
        wastewaterManagement: 'UNTREATED',
        organicFarming: false
      });

      assert.ok(result.finalWQI < 65);
      assert.ok(result.netChange < 0);
    });
  });

  describe('6. Sustainability Scoring Model', () => {
    it('should award high scores for balanced recharge, drip irrigation, and high storage', () => {
      const score = calculateSustainabilityScore({
        storagePercentage: 65,
        rechargeM3: 120000,
        extractionM3: 100000,
        irrigationMethod: 'DRIP',
        waterSavingsM3: 35000,
        artificialRechargeM3: 25000,
        waterQualityIndex: 85
      });

      assert.ok(score.overallScore >= 80);
      assert.ok(score.explanations.length > 0);
    });

    it('should penalize severe overdraft, flood irrigation, and depleted aquifers', () => {
      const score = calculateSustainabilityScore({
        storagePercentage: 15, // Critical
        rechargeM3: 20000,
        extractionM3: 150000, // 7.5x overdraft
        irrigationMethod: 'FLOOD',
        waterSavingsM3: 0,
        artificialRechargeM3: 0,
        waterQualityIndex: 40
      });

      assert.ok(score.overallScore < 35);
      assert.ok(score.recommendations.length > 0);
    });
  });

  describe('7. Scenario Engine & Educational Presets', () => {
    it('should supply exactly 6 structured educational scenarios', () => {
      const list = getScenarioList();
      assert.equal(list.length, 6);
      const expectedIds = [
        'NORMAL_MONSOON',
        'DROUGHT_YEAR',
        'EXCESSIVE_EXTRACTION',
        'SUSTAINABLE_FARMING',
        'RAINWATER_HARVESTING',
        'POLLUTION_CRISIS'
      ];
      for (const id of expectedIds) {
        assert.ok(list.some((s) => s.id === id));
      }
    });

    it('getScenarioById should retrieve scenario with initialConditions', () => {
      const scenario = getScenarioById('DROUGHT_YEAR');
      assert.equal(scenario.id, 'DROUGHT_YEAR');
      assert.equal(scenario.initialConditions.rainfallMm, 280);
      assert.ok(scenario.learningObjectives.length >= 3);
    });
  });

  describe('8. Master Water Balance Simulation Loop', () => {
    it('should execute end-to-end simulation step deterministically', () => {
      const result = runSimulationEngine({
        rainfallMm: 700,
        catchmentAreaM2: 5000000,
        initialStorageM3: 500000,
        maxCapacityM3: 1000000,
        crops: [{ crop: 'WHEAT', hectares: 20 }],
        irrigationMethod: 'SPRINKLER'
      });

      assert.ok(result.waterBalance.rainfallVolumeM3 > 0);
      assert.ok(result.waterBalance.rechargeM3 > 0);
      assert.ok(result.waterBalance.extractionM3 > 0);
      assert.ok(result.waterBalance.finalStorageM3 > 0);
      assert.ok(result.sustainability.overallScore >= 0 && result.sustainability.overallScore <= 100);
      assert.ok(result.waterQuality.finalWQI >= 0 && result.waterQuality.finalWQI <= 100);
      assert.ok(result.hydrologicalAssumptions.length > 0);
    });
  });

});
