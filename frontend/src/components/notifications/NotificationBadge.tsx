import React from 'react';
import { NotificationCategory } from '../../types/notification';
import { 
  Target, 
  CheckCircle2, 
  Zap, 
  Trophy, 
  Award, 
  Clock, 
  AlertTriangle, 
  GraduationCap, 
  Calendar, 
  Megaphone,
  Activity,
  Layers
} from 'lucide-react';

interface NotificationBadgeProps {
  category: NotificationCategory;
  size?: 'sm' | 'md';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ category, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (category) {
      case 'MISSION_ASSIGNED':
        return {
          label: 'Mission Assigned',
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: Target
        };
      case 'MISSION_COMPLETED':
        return {
          label: 'Mission Completed',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2
        };
      case 'XP_EARNED':
        return {
          label: 'XP Reward',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: Zap
        };
      case 'LEVEL_UNLOCKED':
        return {
          label: 'Level Ascended',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: Trophy
        };
      case 'ACHIEVEMENT_UNLOCKED':
        return {
          label: 'Badge Unlocked',
          color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
          icon: Award
        };
      case 'CHALLENGE_STARTED':
      case 'CHALLENGE_ENDING_SOON':
        return {
          label: 'Challenge Alert',
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          icon: Clock
        };
      case 'TEACHER_ANNOUNCEMENT':
        return {
          label: 'Teacher Announcement',
          color: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
          icon: GraduationCap
        };
      case 'ASSIGNMENT_DEADLINE_APPROACHING':
      case 'ASSIGNMENT_OVERDUE':
        return {
          label: 'Deadline Alert',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: AlertTriangle
        };
      case 'STUDENT_PROGRESS_UPDATE':
        return {
          label: 'Progress Update',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: Activity
        };
      case 'PLATFORM_ANNOUNCEMENT':
      default:
        return {
          label: 'Platform Notice',
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: Megaphone
        };
    }
  };

  const { label, color, icon: Icon } = getBadgeConfig();

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${color} ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};
