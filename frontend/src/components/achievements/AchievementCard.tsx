import React from 'react';
import { Achievement } from '../../types/gamification';
import { 
  Award, 
  Droplet, 
  CloudRain, 
  Gauge, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Crown, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onSelect?: (achievement: Achievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onSelect }) => {
  const getBadgeIcon = (iconIdentifier: string) => {
    switch (iconIdentifier) {
      case 'award':
        return Award;
      case 'droplet':
        return Droplet;
      case 'cloud-rain':
        return CloudRain;
      case 'gauge':
        return Gauge;
      case 'shield-check':
        return ShieldCheck;
      case 'sparkles':
        return Sparkles;
      case 'sun':
        return Sun;
      case 'crown':
        return Crown;
      default:
        return Award;
    }
  };

  const IconComponent = getBadgeIcon(achievement.iconIdentifier);

  const getConditionText = (cond: any) => {
    if (!cond) return 'Complete hydrological tasks';
    switch (cond.type) {
      case 'COMPLETED_MISSIONS_COUNT':
        return `Complete ${cond.minCount} conservation mission(s)`;
      case 'WATER_SAVINGS_M3':
        return `Save ${cond.minSavingsM3?.toLocaleString()} m³ of water`;
      case 'ARTIFICIAL_RECHARGE_M3':
        return `Recharge ${cond.minRechargeM3?.toLocaleString()} m³ runoff`;
      case 'IRRIGATION_METHOD':
        return `Use ${cond.method} micro-irrigation`;
      case 'STORAGE_PERCENTAGE':
        return `Maintain aquifer storage ≥ ${cond.minPercentage}%`;
      case 'WATER_QUALITY_INDEX':
        return `Attain Water Quality Index ≥ ${cond.minWQI}`;
      case 'DROUGHT_SURVIVAL':
        return 'Survive drought without critical aquifer drying';
      default:
        return 'Master conservation criteria';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(achievement)}
      className={`glass-panel rounded-2xl p-5 flex flex-col items-center text-center transition-all ${
        achievement.isUnlocked
          ? 'border-purple-500/40 bg-purple-950/15 shadow-xl hover:border-purple-400'
          : 'opacity-60 border-slate-800 bg-slate-900/40 hover:opacity-80'
      }`}
    >
      {/* Badge Icon Emblem */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 relative transition-transform duration-300 ${
          achievement.isUnlocked
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
            : 'bg-slate-800 border border-slate-700 text-slate-500 grayscale'
        }`}
      >
        <IconComponent className="w-8 h-8" />
        {achievement.isUnlocked && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-slate-950" />
          </span>
        )}
      </div>

      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
        {achievement.code.replace(/_/g, ' ')}
      </span>

      <h3 className="text-sm font-bold text-white mb-1 leading-snug">
        {achievement.name}
      </h3>

      <p className="text-xs text-slate-400 leading-snug mb-3 line-clamp-2">
        {achievement.description}
      </p>

      {/* Unlock Condition Box */}
      <div className="w-full bg-slate-950/60 p-2 rounded-lg border border-slate-800 mb-3 text-[11px] text-slate-300">
        <span className="text-[9px] uppercase font-bold text-slate-500 block">Condition:</span>
        <span className="font-medium text-slate-300">{getConditionText(achievement.unlockCondition)}</span>
      </div>

      {/* Footer Status & XP */}
      <div className="mt-auto w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-purple-300 font-bold font-mono">
          +{achievement.xpReward} XP
        </span>

        {achievement.isUnlocked ? (
          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'Unlocked'}
          </span>
        ) : (
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </span>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;
