import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { simulationService } from '../../services/simulation.service';
import { BackendSimulationRequest, BackendSimulationResponse } from '../../types/simulation';
import { 
  X, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Droplets, 
  CloudRain, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  Info
} from 'lucide-react';

export const SimulationModal: React.FC = () => {
  const isOpen = useGameStore((state) => state.isSimulationModalOpen);
  const setOpen = useGameStore((state) => state.setSimulationModalOpen);
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const simulationLifecycle = useGameStore((state) => state.simulationLifecycle);
  const setSimulationLifecycle = useGameStore((state) => state.setSimulationLifecycle);
  const applySimulationResult = useGameStore((state) => state.applySimulationResult);
  const latestResult = useGameStore((state) => state.latestSimulationResult);
  const applyAuthoritativeReward = useGameStore((state) => state.applyAuthoritativeReward);

  // Simulation Configuration Form State
  const [rainfallMm, setRainfallMm] = useState<number>(700);
  const [season, setSeason] = useState<'Monsoon' | 'Post-Monsoon' | 'Winter' | 'Summer'>('Monsoon');
  const [irrigationMethod, setIrrigationMethod] = useState<'FLOOD' | 'DRIP' | 'SPRINKLER'>('DRIP');
  const [selectedCrop, setSelectedCrop] = useState<'SUGARCANE' | 'MILLETS' | 'WHEAT' | 'PULSES'>('MILLETS');
  const [cropHectares, setCropHectares] = useState<number>(25);
  const [checkDamsCount, setCheckDamsCount] = useState<number>(1);
  const [percolationTanksCount, setPercolationTanksCount] = useState<number>(1);
  const [rooftopRWHUnits, setRooftopRWHUnits] = useState<number>(35);
  const [organicFarming, setOrganicFarming] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setSimulationLifecycle('RUNNING');
    setErrorMessage(null);

    const payload: BackendSimulationRequest = {
      villageId: groundwaterData.villageId || 'a0000000-0000-0000-0000-000000000001',
      season,
      rainfallMm,
      irrigationMethod,
      crops: [
        {
          crop: selectedCrop,
          hectares: cropHectares,
        },
      ],
      interventions: {
        checkDamsCount,
        percolationTanksCount,
        rooftopRWHUnits,
      },
      organicFarming,
      simulationDays: 90,
    };

    try {
      const response: BackendSimulationResponse = await simulationService.runSimulation(payload);
      applySimulationResult(response);
      applyAuthoritativeReward(50, 'Completed Village Hydrological Simulation');
    } catch (err: any) {
      setSimulationLifecycle('FAILED');
      setErrorMessage(err.message || 'Simulation execution failed. Please verify parameters.');
    }
  };

  const getConditionBadgeStyle = (cond: string) => {
    switch (cond) {
      case 'OPTIMAL':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'SAFE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'SEMI_CRITICAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CRITICAL':
      default:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-glow w-full max-w-3xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-sky-500/30 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Authoritative Hydrological Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Scientific Groundwater Simulation Laboratory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active Village: <span className="text-white font-semibold">{groundwaterData.villageName}</span> ({groundwaterData.district}, {groundwaterData.state})
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs">
          {/* 1. Rainfall Slider */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center font-semibold mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-400" />
                Monsoon Rainfall
              </span>
              <span className="text-sky-300 font-mono font-bold text-sm">
                {rainfallMm} mm
              </span>
            </div>
            <input
              type="range"
              min="350"
              max="1400"
              step="25"
              value={rainfallMm}
              disabled={simulationLifecycle === 'RUNNING'}
              onChange={(e) => setRainfallMm(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>350 mm (Drought)</span>
              <span>700 mm (Normal)</span>
              <span>1400 mm (Deluge)</span>
            </div>
          </div>

          {/* 2. Irrigation Method */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-300 font-semibold block mb-2 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Irrigation Method
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['FLOOD', 'SPRINKLER', 'DRIP'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={simulationLifecycle === 'RUNNING'}
                  onClick={() => setIrrigationMethod(method)}
                  className={`py-2 rounded-xl font-bold text-[11px] transition-all ${
                    irrigationMethod === method
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50'
                  }`}
                >
                  {method === 'DRIP' ? '💧 Drip (Efficient)' : method === 'SPRINKLER' ? '🌧️ Sprinkler' : '🌊 Flood'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Crop Selection & Hectares */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 font-semibold">Cropping Pattern</span>
              <span className="text-amber-400 font-mono font-bold text-xs">{cropHectares} Hectares</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {(['MILLETS', 'PULSES', 'WHEAT', 'SUGARCANE'] as const).map((crop) => (
                <button
                  key={crop}
                  type="button"
                  disabled={simulationLifecycle === 'RUNNING'}
                  onClick={() => setSelectedCrop(crop)}
                  className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] transition-all truncate ${
                    selectedCrop === crop
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50'
                  }`}
                >
                  {crop === 'MILLETS' ? '🌾 Millets (Low Water)' : crop === 'PULSES' ? '🌱 Pulses (Balanced)' : crop === 'WHEAT' ? '🌿 Wheat (Moderate)' : '🎋 Sugarcane (High)'}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={cropHectares}
              disabled={simulationLifecycle === 'RUNNING'}
              onChange={(e) => setCropHectares(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* 4. Artificial Recharge Interventions */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-300 font-semibold mb-2">Recharge Interventions</span>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-slate-400 block font-medium">Check Dams</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5">{checkDamsCount}</span>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    type="button"
                    disabled={checkDamsCount <= 0 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setCheckDamsCount(Math.max(0, checkDamsCount - 1))}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >-</button>
                  <button
                    type="button"
                    disabled={checkDamsCount >= 4 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setCheckDamsCount(checkDamsCount + 1)}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-slate-400 block font-medium">Percolation Tanks</span>
                <span className="text-xs font-bold text-cyan-400 block mt-0.5">{percolationTanksCount}</span>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    type="button"
                    disabled={percolationTanksCount <= 0 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setPercolationTanksCount(Math.max(0, percolationTanksCount - 1))}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >-</button>
                  <button
                    type="button"
                    disabled={percolationTanksCount >= 3 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setPercolationTanksCount(percolationTanksCount + 1)}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-slate-400 block font-medium">RWH Houses</span>
                <span className="text-xs font-bold text-sky-400 block mt-0.5">{rooftopRWHUnits}</span>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    type="button"
                    disabled={rooftopRWHUnits <= 0 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setRooftopRWHUnits(Math.max(0, rooftopRWHUnits - 10))}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >-</button>
                  <button
                    type="button"
                    disabled={rooftopRWHUnits >= 100 || simulationLifecycle === 'RUNNING'}
                    onClick={() => setRooftopRWHUnits(rooftopRWHUnits + 10)}
                    className="w-5 h-5 rounded bg-slate-700 text-slate-200 font-bold"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-4 flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Simulation Output Dashboard */}
        {latestResult && simulationLifecycle === 'COMPLETED' && (
          <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-sky-500/30 space-y-4 mb-4 animate-in slide-in-from-bottom duration-300">
            {/* Header Result Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Authoritative Simulation Output
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${getConditionBadgeStyle(
                  latestResult.waterBalance.conditionCategory
                )}`}
              >
                {latestResult.waterBalance.conditionLabel} ({latestResult.waterBalance.storagePercentage}%)
              </span>
            </div>

            {/* A. Water Balance Grid */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                A. Mass Conservation Water Balance (m³)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Initial Storage</span>
                  <span className="text-xs font-bold text-white font-mono">{latestResult.waterBalance.initialStorageM3.toLocaleString()} m³</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Total Recharge</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{latestResult.waterBalance.rechargeM3.toLocaleString()} m³</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Total Extraction</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">-{latestResult.waterBalance.extractionM3.toLocaleString()} m³</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Final Aquifer Storage</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">{latestResult.waterBalance.finalStorageM3.toLocaleString()} m³</span>
                </div>
              </div>
            </div>

            {/* B & C: Groundwater Health & Water Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  B. Groundwater Aquifer Health
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-white font-mono">{latestResult.waterBalance.storagePercentage}%</span>
                    <span className="text-[10px] text-slate-400 block">Saturated Volume</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-sky-300 font-mono">
                      {latestResult.waterBalance.storageChangeM3 >= 0 ? '+' : ''}{latestResult.waterBalance.storageChangeM3.toLocaleString()} m³
                    </span>
                    <span className="text-[10px] text-slate-400 block">Net Storage Delta</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  C. Simulated Water Quality Index
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-cyan-400 font-mono">{latestResult.waterQuality.finalWQI} / 100</span>
                    <span className="text-[10px] text-slate-400 block">Classification: {latestResult.waterQuality.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400">
                      {latestResult.waterQuality.netChange >= 0 ? `+${latestResult.waterQuality.netChange}` : latestResult.waterQuality.netChange} WQI
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 italic">
                  *Educational indicator. Does not replace laboratory potability testing.
                </p>
              </div>
            </div>

            {/* D. Sustainability & Learning Feedback */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                D. Sustainability Assessment & Learning Feedback
              </h4>
              <div className="bg-purple-950/20 border border-purple-500/30 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-200">Watershed Sustainability Score:</span>
                  <span className="text-sm font-bold text-purple-300 font-mono">{latestResult.sustainability.overallScore} / 100</span>
                </div>
                <ul className="space-y-1">
                  {latestResult.sustainability.explanations.map((exp, idx) => (
                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer Execution Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 mt-auto">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Values computed using Central Ground Water Board equations</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={simulationLifecycle === 'RUNNING'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {simulationLifecycle === 'RUNNING' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Water Balance...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Simulation (+50 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
