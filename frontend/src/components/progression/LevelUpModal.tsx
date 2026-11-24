import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { LevelBadge } from './LevelBadge';
import { Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LevelUpModal: React.FC = () => {
  const levelUpInfo = useGameStore((state) => state.levelUpInfo);
  const dismissLevelUpModal = useGameStore((state) => state.dismissLevelUpModal);

  if (!levelUpInfo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="glass-panel-glow border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/50 mb-5 animate-bounce">
          <Trophy className="w-10 h-10 fill-current" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4" />
          Level Up Confirmed!
          <Sparkles className="w-4 h-4" />
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          Level {levelUpInfo.newLevel} Achieved
        </h2>

        <p className="text-sky-300 font-bold text-sm mt-1">
          {levelUpInfo.levelTitle}
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Unlocked Hydrological Perks
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            {levelUpInfo.perks || 'Access to new watershed conservation structures, advanced simulation scenarios, and classroom challenges.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={dismissLevelUpModal}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            Continue Conservation
          </button>
          <Link
            to="/missions"
            onClick={dismissLevelUpModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700"
          >
            <span>View New Missions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
