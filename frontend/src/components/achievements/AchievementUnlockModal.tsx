import React from 'react';
import { Achievement } from '../../types/gamification';
import { Award, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose,
}) => {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="glass-panel-glow border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/40 mb-4 animate-bounce">
          <Award className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center justify-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4" />
          Achievement Unlocked!
          <Sparkles className="w-4 h-4" />
        </span>

        <h2 className="text-2xl font-black text-white">
          {achievement.name}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
          {achievement.description}
        </p>

        <div className="my-5 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-purple-300">Reward Awarded:</span>
          <span className="text-base font-extrabold text-amber-300 font-mono">
            +{achievement.xpReward} XP
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-600/30"
        >
          Awesome! Collect Badge
        </button>
      </div>
    </div>
  );
};

export default AchievementUnlockModal;
