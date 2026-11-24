import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Link } from 'react-router-dom';
import { 
  X, 
  CheckCircle, 
  Lightbulb, 
  Activity, 
  Droplets, 
  Info, 
  Target, 
  ArrowRight, 
  Cpu, 
  Sparkles 
} from 'lucide-react';

export const RightContextPanel: React.FC = () => {
  const selectedObject = useGameStore((state) => state.selectedObject);
  const selectObject = useGameStore((state) => state.selectObject);
  const setSimulationModalOpen = useGameStore((state) => state.setSimulationModalOpen);
  const setActiveMissionId = useGameStore((state) => state.setActiveMissionId);

  if (!selectedObject) return null;

  // Determine connected mission based on object category
  const getAssociatedMission = (category: string) => {
    switch (category) {
      case 'HOUSE':
      case 'RAINWATER_HARVESTING':
        return {
          id: 'm-102',
          title: 'Monsoon Runoff & Rainwater Harvesting',
          category: 'RAINWATER_HARVESTING',
          relevance: 'Capture rooftop runoff and direct into recharge pits to prevent storm discharge waste.',
          xpReward: 300,
        };
      case 'CHECK_DAM':
      case 'PERCOLATION_TANK':
        return {
          id: 'm-102',
          title: 'Monsoon Runoff & Rainwater Harvesting',
          category: 'RAINWATER_HARVESTING',
          relevance: 'Slow runoff flow velocities along natural drainage channels to enhance unconfined aquifer percolation.',
          xpReward: 300,
        };
      case 'FARM':
        return {
          id: 'm-103',
          title: 'Precision Micro-Irrigation & Crop Diversification',
          category: 'SUSTAINABLE_AGRICULTURE',
          relevance: 'Adopt drip irrigation and crop water budgeting to cut agricultural water draft by up to 48%.',
          xpReward: 350,
        };
      case 'BOREWELL':
      case 'WELL':
        return {
          id: 'm-101',
          title: 'Foundations of Groundwater Balance',
          category: 'GROUNDWATER_CONSERVATION',
          relevance: 'Monitor drawdown and cone of depression to balance extraction with natural aquifer recharge.',
          xpReward: 200,
        };
      case 'POND':
      case 'RIVER':
      case 'COMMUNITY_TANK':
      default:
        return {
          id: 'm-104',
          title: 'Aquifer Water Quality & Pollution Prevention',
          category: 'WATER_QUALITY',
          relevance: 'Filter non-point source pollutants and agrochemicals to safeguard drinking water aquifers.',
          xpReward: 400,
        };
    }
  };

  const associatedMission = getAssociatedMission(selectedObject.category);

  return (
    <aside className="absolute right-4 top-24 bottom-24 w-80 sm:w-96 z-20 pointer-events-none flex flex-col">
      <div className="glass-panel-glow p-5 rounded-2xl pointer-events-auto flex flex-col flex-1 overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-700/60">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
              {selectedObject.category.replace('_', ' ')}
            </span>
            <h2 className="text-base font-bold text-white mt-1.5 leading-snug">
              {selectedObject.name}
            </h2>
          </div>
          <button
            onClick={() => selectObject(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 text-xs">
          {/* Status Highlight Card */}
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {selectedObject.waterStatus.label}
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {selectedObject.waterStatus.value}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
              style={{ backgroundColor: `${selectedObject.waterStatus.color}25`, color: selectedObject.waterStatus.color }}
            >
              <Activity className="w-4 h-4" />
            </div>
          </div>

          {/* Connected Educational Mission Card */}
          <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/40 p-3.5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Associated Conservation Mission
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300">
                +{associatedMission.xpReward} XP
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">
              {associatedMission.title}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
              {associatedMission.relevance}
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/missions"
                onClick={() => {
                  setActiveMissionId(associatedMission.id);
                  selectObject(null);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <span>View Mission Directive</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Overview
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {selectedObject.description}
            </p>
          </div>

          {/* Educational Role (Hydrology concept) */}
          <div className="bg-sky-950/40 border border-sky-500/20 p-3 rounded-xl">
            <h3 className="text-sky-300 font-semibold mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
              Hydrological Impact
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {selectedObject.educationalRole}
            </p>
          </div>

          {/* Metrics Grid */}
          <div>
            <h3 className="text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Operational Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selectedObject.metrics).map(([key, val]) => (
                <div key={key} className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-xs font-bold text-white mt-0.5 block truncate">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conservation Recommendations */}
          <div>
            <h3 className="text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Recommended Conservation Actions
            </h3>
            <ul className="space-y-1.5">
              {selectedObject.recommendedActions.map((action, idx) => (
                <li
                  key={idx}
                  className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-start gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 text-[11px] leading-snug">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button: Open Simulation to test interventions */}
        <div className="pt-3 border-t border-slate-700/60 flex gap-2">
          <button
            onClick={() => {
              setSimulationModalOpen(true);
              selectObject(null);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>Simulate Hydro Intervention</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightContextPanel;
