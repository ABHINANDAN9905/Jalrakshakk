import api from './api';
import { BackendSimulationRequest, BackendSimulationResponse } from '../types/simulation';
import { classifyAquiferCondition } from '../types/groundwater';

export const simulationService = {
  /**
   * Executes a groundwater simulation step via the authoritative backend Phase 7 engine
   * @param params Validated simulation request parameters
   */
  async runSimulation(params: BackendSimulationRequest): Promise<BackendSimulationResponse> {
    try {
      const response = await api.post('/simulations/run', params);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data as BackendSimulationResponse;
      }
    } catch (err: any) {
      console.warn('[Simulation Service] Backend API call failed, using deterministic Phase 7 fallback engine:', err.message);
    }

    // High-Fidelity Client-side Fallback matching Phase 7 Master Equations
    const rainfallMm = params.rainfallMm || 700;
    const catchmentAreaM2 = 5000000;
    const rainfallVolumeM3 = (rainfallMm / 1000) * catchmentAreaM2;
    const runoffVolumeM3 = rainfallVolumeM3 * 0.40;
    const infiltrationVolumeM3 = rainfallVolumeM3 * 0.45;

    // Interventions & Artificial Recharge
    const rwhUnits = params.interventions?.rooftopRWHUnits || 0;
    const checkDams = params.interventions?.checkDamsCount || 0;
    const percolationTanks = params.interventions?.percolationTanksCount || 0;

    const naturalRechargeM3 = infiltrationVolumeM3 * 0.50;
    const artificialRechargeM3 = (rwhUnits * 80) + (checkDams * 30000) + (percolationTanks * 45000);
    const totalRechargeM3 = Math.round(naturalRechargeM3 + artificialRechargeM3);

    // Extraction Calculation
    let irrigationMultiplier = 1.0; // FLOOD
    if (params.irrigationMethod === 'DRIP') irrigationMultiplier = 0.45;
    if (params.irrigationMethod === 'SPRINKLER') irrigationMultiplier = 0.70;

    let cropWaterDemand = 280000;
    if (params.crops && params.crops.length > 0) {
      cropWaterDemand = params.crops.reduce((acc, c) => acc + (c.hectares * 11000), 0);
    }

    const domesticDemand = (4000 * 55 * 90) / 1000; // 19,800 m3
    const agriculturalExtraction = Math.round(cropWaterDemand * irrigationMultiplier);
    const totalExtractionM3 = agriculturalExtraction + domesticDemand;
    const naturalDischargeM3 = 15000;

    // Aquifer Balance
    const maxCapacityM3 = 1000000;
    const initialStorageM3 = 500000;
    const netBalanceM3 = totalRechargeM3 - totalExtractionM3 - naturalDischargeM3;
    const finalStorageM3 = Math.min(maxCapacityM3, Math.max(0, initialStorageM3 + netBalanceM3));
    const storagePercentage = Number(((finalStorageM3 / maxCapacityM3) * 100).toFixed(1));

    const conditionCategory = classifyAquiferCondition(storagePercentage);

    // Water Quality Index
    let wqi = 75;
    if (params.organicFarming) wqi += 6;
    if (params.chemicalIntensity === 'HIGH') wqi -= 10;
    if (params.wastewaterManagement === 'TREATMENT') wqi += 8;
    wqi = Math.min(95, Math.max(35, wqi));

    // Sustainability score
    const rechargeToExtractionRatio = totalRechargeM3 / (totalExtractionM3 + 1);
    const sustainabilityScore = Math.min(100, Math.max(25, Math.round(rechargeToExtractionRatio * 75 + (wqi * 0.2))));

    const explanations: string[] = [];
    if (params.irrigationMethod === 'DRIP') {
      explanations.push('Drip irrigation saved up to 55% water compared to conventional flood irrigation.');
    }
    if (artificialRechargeM3 > 50000) {
      explanations.push(`Artificial recharge structures funneled +${artificialRechargeM3.toLocaleString()} m³ directly into the basalt aquifer.`);
    }
    if (storagePercentage < 20.0) {
      explanations.push('Severe overdraft: Water table depleted below critical 20% storage threshold.');
    } else if (storagePercentage > 70.0) {
      explanations.push('Aquifer saturated: Baseflow feeds seasonal streams and shallow dug wells.');
    }

    return {
      simulationId: `sim-fallback-${Date.now()}`,
      persistedInPostgres: false,
      executedAt: new Date().toISOString(),
      scenarioId: params.scenarioId || 'CUSTOM_SIMULATION',
      season: params.season || 'Monsoon',
      waterBalance: {
        initialStorageM3,
        rainfallMm,
        rainfallVolumeM3,
        runoffVolumeM3,
        infiltrationVolumeM3,
        rechargeM3: totalRechargeM3,
        extractionM3: totalExtractionM3,
        naturalDischargeM3,
        finalStorageM3,
        storageChangeM3: finalStorageM3 - initialStorageM3,
        storagePercentage,
        conditionCategory,
        conditionLabel: conditionCategory === 'OPTIMAL' ? 'Optimal / Saturated' : conditionCategory === 'SAFE' ? 'Safe / Balanced' : conditionCategory === 'SEMI_CRITICAL' ? 'Semi-Critical / Receding' : 'Critical / Severely Depleted',
        rejectedRechargeM3: 0,
        unmetDeficitM3: storagePercentage === 0 ? Math.abs(netBalanceM3) : 0,
      },
      waterQuality: {
        initialWQI: 75,
        finalWQI: wqi,
        netChange: wqi - 75,
        category: wqi > 80 ? 'EXCELLENT' : wqi > 65 ? 'GOOD' : 'FAIR',
        disclaimer: 'The Educational Water Quality Index (WQI) is a simulated pedagogical indicator and does not replace certified laboratory chemical testing.'
      },
      sustainability: {
        overallScore: sustainabilityScore,
        factorScores: {
          aquiferReserve: storagePercentage,
          rechargeExtractionBalance: Math.min(100, Math.round(rechargeToExtractionRatio * 80)),
          waterQuality: wqi,
        },
        explanations,
        recommendations: [
          'Rotate high-water cash crops with drought-hardy legumes or millets.',
          'Desilt check dams prior to monsoon to maximize runoff impoundment.'
        ]
      },
      interventions: {
        artificialRechargeM3,
        runoffCapturedM3: artificialRechargeM3,
        uncapturedRunoffM3: Math.max(0, runoffVolumeM3 - artificialRechargeM3),
        deployed: {
          checkDams: checkDams,
          percolationTanks: percolationTanks,
          rooftopRWHUnits: rwhUnits
        }
      },
      sectors: {
        agriculturalExtractionM3: agriculturalExtraction,
        domesticExtractionM3: domesticDemand,
        industrialExtractionM3: 0,
        waterSavingsM3: params.irrigationMethod === 'DRIP' ? Math.round(cropWaterDemand * 0.55) : 0,
        cropBreakdown: params.crops ? params.crops.map(c => ({ crop: c.crop, hectares: c.hectares, waterDemandM3: c.hectares * 11000 })) : []
      },
      hydrologicalAssumptions: [
        `Catchment area: 5 km² (${catchmentAreaM2.toLocaleString()} m²).`,
        `Precipitation depth: ${rainfallMm} mm over monsoon season.`,
        `Hard-rock basalt aquifer specific yield: 2.5%.`
      ]
    };
  },
};
