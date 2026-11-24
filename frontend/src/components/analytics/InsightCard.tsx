import React from 'react';
import { LearningObservation, LearningRecommendation } from '../../types/analytics';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles, Lightbulb } from 'lucide-react';

interface InsightCardProps {
  observation?: LearningObservation;
  recommendation?: LearningRecommendation;
}

export const InsightCard: React.FC<InsightCardProps> = ({ observation, recommendation }) => {
  if (observation) {
    const isPositive = observation.sentiment === 'POSITIVE';
    const isCritical = observation.sentiment === 'CRITICAL' || observation.sentiment === 'NEGATIVE';

    return (
      <div
        className={`p-4 rounded-xl border transition-all ${
          isPositive
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
            : isCritical
            ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
            : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isPositive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {isCritical && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {!isPositive && !isCritical && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {observation.title}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-900/60 border border-slate-700/50 text-slate-300">
                {observation.type}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{observation.summary}</p>
            {observation.rule && (
              <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                Rule: {observation.rule}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (recommendation) {
    const isCritical = recommendation.priority === 'CRITICAL' || recommendation.priority === 'HIGH';

    return (
      <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Lightbulb className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Action: {recommendation.action.replace(/_/g, ' ')}
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  isCritical ? 'bg-rose-900/50 text-rose-300' : 'bg-sky-900/50 text-sky-300'
                }`}
              >
                {recommendation.priority} PRIORITY
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{recommendation.suggestion}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
