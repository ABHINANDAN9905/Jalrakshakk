import React, { useEffect, useState } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { WaterMentorChat } from '../components/ai-mentor/WaterMentorChat';
import { aiMentorService, ConservationRecommendation } from '../services/aiMentor.service';
import { useGameStore } from '../store/gameStore';
import { Bot, ArrowRight, Lightbulb, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const WaterMentorPage: React.FC = () => {
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const selectObject = useGameStore((state) => state.selectObject);
  const [recommendations, setRecommendations] = useState<ConservationRecommendation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    aiMentorService.getRecommendations(groundwaterData.villageId).then(setRecommendations);
  }, [groundwaterData.villageId]);

  const handleActionClick = (target: string) => {
    navigate('/');
    if (target === 'NAVIGATE_FARM') {
      selectObject({
        id: 'farm-drip-millet-02',
        name: 'Micro-Irrigated Millet Field',
        category: 'FARM',
        position: [24, 0, -18],
        description: 'Drought-resilient pearl millet farm with subsurface drip laterals.',
        educationalRole: 'Demonstrates 55-65% water savings through micro-irrigation.',
        waterStatus: { label: 'High Efficiency', value: '4,200 m³/ha', trend: 'up', color: '#10b981' },
        metrics: { efficiencyRating: '92%' },
        recommendedActions: ['Maintain drip emitters', 'Organic mulching']
      });
    } else if (target === 'NAVIGATE_CHECK_DAM') {
      selectObject({
        id: 'struct-check-dam-01',
        name: 'Masonry Check Dam',
        category: 'CHECK_DAM',
        position: [-18, 0, -32],
        description: 'Barrier across stream bed to slow runoff velocity and impound water.',
        educationalRole: 'Increases infiltration time into surrounding basalt aquifer.',
        waterStatus: { label: 'Impounding Active', value: '1.8 m head', trend: 'up', color: '#10b981' },
        metrics: { storageCapacity: '18,000 m³ pondage' },
        recommendedActions: ['Pre-monsoon desilting']
      });
    } else if (target === 'NAVIGATE_RWH') {
      selectObject({
        id: 'house-rwh-01',
        name: 'Rooftop RWH Pucca House',
        category: 'RAINWATER_HARVESTING',
        position: [12, 0, 10],
        description: 'Dwelling equipped with rooftop catchments and dual-chamber filter.',
        educationalRole: 'Directly channels filtered monsoon rain into groundwater.',
        waterStatus: { label: 'Active Catchment', value: '72,000 L / year', trend: 'up', color: '#10b981' },
        metrics: { storageCapacity: '15,000 L sump' },
        recommendedActions: ['Clean roof surface', 'Replace sand filter media']
      });
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-8 max-w-7xl mx-auto w-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>Intelligent Science Mentor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              JalRakshak AI Water Mentor
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Interactive science dialogue grounded in your simulated village water balance and Central Ground Water Board principles.
            </p>
          </div>
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>Return to 3D Village</span>
            <Compass className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-Column Layout: Chat on Left, Recommendations on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <WaterMentorChat />
          </div>

          {/* Side Drawer: Authoritative Recommendations */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Conservation Directives
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Computed from your latest groundwater balance to maximize sustainability score.
            </p>

            <div className="space-y-3 overflow-y-auto pr-1">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {rec.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Priority: {rec.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{rec.impact}</p>

                  <button
                    onClick={() => handleActionClick(rec.gameAction)}
                    className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-bold flex items-center justify-center gap-1.5 border border-sky-500/20 transition-all"
                  >
                    <span>{rec.gameActionLabel}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
