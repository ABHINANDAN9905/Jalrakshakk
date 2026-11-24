import React from 'react';
import { SimulationComparisonData } from '../../types/analytics';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Droplets, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface SimulationComparisonCardProps {
  comparisonData: SimulationComparisonData;
}

export const SimulationComparisonCard: React.FC<SimulationComparisonCardProps> = ({ comparisonData }) => {
  const { baseline, intervention, comparison } = comparisonData;

  const isScorePositive = comparison.deltaSustainabilityScore >= 0;
  const isStoragePositive = comparison.deltaFinalStorageM3 >= 0;

  return (
    <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Before vs. After Intervention Analysis</span>
          </div>
          <h3 className="text-lg font-black text-white mt-0.5">
            Hydrological Impact & Aquifer Restoration
          </h3>
          <p className="text-xs text-slate-400">
            Authoritative simulation comparison isolating the impact of conservation decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
            Baseline: <strong className="text-white">{baseline.aquiferCondition.label}</strong>
          </span>
          <span className="text-slate-500">→</span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300">
            Post-Intervention: <strong className="text-white">{intervention.aquiferCondition.label}</strong>
          </span>
        </div>
      </div>

      {/* 4 Metric Deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Sustainability Score */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sustainability Rating
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{intervention.sustainabilityScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold mt-1">
            {isScorePositive ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />+{comparison.deltaSustainabilityScore} pts
              </span>
            ) : (
              <span className="text-rose-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />{comparison.deltaSustainabilityScore} pts
              </span>
            )}
            <span className="text-[10px] text-slate-500">vs baseline</span>
          </div>
        </div>

        {/* Metric 2: Storage Delta */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Net Aquifer Storage
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-cyan-300">
              {(intervention.hydrologicalBalance.finalStorageM3).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">m³</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold mt-1">
            {isStoragePositive ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />+{comparison.deltaFinalStorageM3.toLocaleString()} m³
              </span>
            ) : (
              <span className="text-rose-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />{comparison.deltaFinalStorageM3.toLocaleString()} m³
              </span>
            )}
            <span className="text-[10px] text-slate-500">delta</span>
          </div>
        </div>

        {/* Metric 3: Extraction Reduction */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Draft Reduction
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400">
              {comparison.extractionReductionPercentage > 0 ? `-${comparison.extractionReductionPercentage}%` : '0%'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Draft: {(intervention.hydrologicalBalance.extractionM3).toLocaleString()} m³
          </div>
        </div>

        {/* Metric 4: Recharge Gain */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Recharge Infiltration
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-sky-400">
              +{comparison.rechargeIncreasePercentage}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Total: {(intervention.hydrologicalBalance.rechargeM3).toLocaleString()} m³
          </div>
        </div>
      </div>

      {/* Educational Keypoints Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-cyan-950/20 to-slate-900 border border-cyan-800/40 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Scientifically Explainable Keypoints</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-200 pl-1">
          {comparison.impactKeypoints.map((pt, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
