import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Zap, Sparkles, X } from 'lucide-react';

export const XPRewardToast: React.FC = () => {
  const rewardToast = useGameStore((state) => state.rewardToast);
  const dismissRewardToast = useGameStore((state) => state.dismissRewardToast);

  useEffect(() => {
    if (!rewardToast) return;
    const timer = setTimeout(() => {
      dismissRewardToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [rewardToast, dismissRewardToast]);

  if (!rewardToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="glass-panel-glow px-4 py-3 rounded-2xl border-2 border-amber-400/80 bg-slate-900/95 shadow-2xl flex items-center gap-3.5 max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/40 animate-pulse">
          <Zap className="w-6 h-6 fill-current" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{rewardToast.amount} XP Awarded!</span>
          </div>
          <p className="text-xs text-white font-medium truncate mt-0.5">
            {rewardToast.reason}
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            Authoritative Server Verified
          </span>
        </div>

        <button
          onClick={dismissRewardToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default XPRewardToast;
