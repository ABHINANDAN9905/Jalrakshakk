import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Layers, Sun, Moon, RotateCcw, Play, Eye } from 'lucide-react';

export const BottomControls: React.FC = () => {
  const isUndergroundView = useGameStore((state) => state.isUndergroundView);
  const toggleUndergroundView = useGameStore((state) => state.toggleUndergroundView);
  const isDayTime = useGameStore((state) => state.isDayTime);
  const toggleDayNight = useGameStore((state) => state.toggleDayNight);
  const resetCamera = useGameStore((state) => state.resetCamera);
  const setSimulationModalOpen = useGameStore((state) => state.setSimulationModalOpen);

  return (
    <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center">
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl border border-slate-700/60">
        {/* Toggle Underground Aquifer View */}
        <button
          onClick={toggleUndergroundView}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isUndergroundView
              ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
          }`}
          title="Toggle Subterranean Aquifer Cross-Section"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{isUndergroundView ? 'Surface Village' : 'Underground Aquifer'}</span>
        </button>

        {/* Run Simulation Modal Trigger */}
        <button
          onClick={() => setSimulationModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Simulate Monsoon</span>
        </button>

        {/* Day / Night Toggle */}
        <button
          onClick={toggleDayNight}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title={isDayTime ? 'Switch to Night View' : 'Switch to Day View'}
        >
          {isDayTime ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Reset Camera */}
        <button
          onClick={resetCamera}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
