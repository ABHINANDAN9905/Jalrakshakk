import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Target, 
  Trophy, 
  Award, 
  BarChart3, 
  Users,
  Bot
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: '3D Village', icon: Compass },
  { path: '/mentor', label: 'AI Water Mentor', icon: Bot },
  { path: '/missions', label: 'Missions', icon: Target },
  { path: '/challenges', label: 'Daily Quests', icon: Trophy },
  { path: '/achievements', label: 'Badges', icon: Award },
  { path: '/analytics', label: 'Water Budget', icon: BarChart3 },
  { path: '/leaderboard', label: 'Leaderboard', icon: Users },
];

export const LeftNav: React.FC = () => {
  return (
    <aside className="absolute left-4 top-24 bottom-24 z-20 flex flex-col items-center justify-center pointer-events-none">
      <nav className="glass-panel p-2 rounded-2xl flex flex-col gap-2.5 pointer-events-auto shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />

              {/* Tooltip on Hover */}
              <span className="absolute left-14 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl border border-slate-700 z-50">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
