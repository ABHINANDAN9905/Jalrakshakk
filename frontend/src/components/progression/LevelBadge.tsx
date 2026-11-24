import React from 'react';
import { Award, Shield, Sparkles } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  levelTitle: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  levelTitle,
  size = 'md',
  showTitle = true,
}) => {
  const getTierColors = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950',
          glow: 'shadow-emerald-500/20'
        };
      case 2:
        return {
          bg: 'bg-sky-500/20',
          border: 'border-sky-500/40',
          text: 'text-sky-400',
          badge: 'bg-sky-500 text-slate-950',
          glow: 'shadow-sky-500/20'
        };
      case 3:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badge: 'bg-blue-500 text-white',
          glow: 'shadow-blue-500/20'
        };
      case 4:
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          badge: 'bg-purple-500 text-white',
          glow: 'shadow-purple-500/20'
        };
      case 5:
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950',
          glow: 'shadow-amber-500/20'
        };
      case 6:
      default:
        return {
          bg: 'bg-gradient-to-r from-amber-500/30 to-purple-500/30',
          border: 'border-amber-400/60',
          text: 'text-amber-300',
          badge: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black',
          glow: 'shadow-amber-500/40'
        };
    }
  };

  const colors = getTierColors(level);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${colors.bg} ${colors.border} ${colors.text}`}>
        <Award className="w-3 h-3" />
        <span>Lvl {level}</span>
        {showTitle && <span className="text-slate-300">· {levelTitle}</span>}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative shadow-xl ${colors.bg} ${colors.border} ${colors.glow}`}>
          <Shield className={`w-8 h-8 ${colors.text}`} />
          <span className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
            Lvl {level}
          </span>
        </div>
        {showTitle && (
          <div className="mt-3">
            <h4 className="text-sm font-extrabold text-white flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {levelTitle}
            </h4>
            <span className="text-[11px] text-slate-400">Classroom Rank Tier</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border ${colors.bg} ${colors.border} shadow-lg ${colors.glow}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${colors.badge}`}>
        {level}
      </div>
      {showTitle && (
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-400 leading-tight">Tier {level}</span>
          <span className={`text-xs font-bold leading-tight ${colors.text}`}>{levelTitle}</span>
        </div>
      )}
    </div>
  );
};

export default LevelBadge;
