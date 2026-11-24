import React from 'react';
import { MentorChatMessage, MentorAction } from '../../services/aiMentor.service';
import { Bot, User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface MentorMessageProps {
  message: MentorChatMessage;
  actions?: MentorAction[];
}

export const MentorMessage: React.FC<MentorMessageProps> = ({ message, actions }) => {
  const isAssistant = message.role === 'assistant';
  const navigate = useNavigate();
  const selectObject = useGameStore((state) => state.selectObject);

  const handleGameAction = (target: string) => {
    navigate('/');
    // Select corresponding 3D object in store
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
    }
  };

  return (
    <div className={`flex gap-3.5 my-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-sm shadow-lg ${
          isAssistant
            ? 'bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-sky-500/20'
            : 'bg-purple-600 text-white shadow-purple-500/20'
        }`}
      >
        {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
        <div
          className={`p-4 rounded-2xl text-xs leading-relaxed ${
            isAssistant
              ? 'glass-panel border-sky-500/20 text-slate-200'
              : 'bg-sky-600 text-white shadow-md'
          }`}
        >
          {isAssistant && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 text-[10px]">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                JalRakshak AI Water Mentor
              </span>
              <span className="text-slate-400 font-mono">
                {message.isAiGenerated ? 'OpenAI GPT-4o' : 'Educational Engine'}
              </span>
            </div>
          )}

          {/* Formatted Text Content */}
          <div className="whitespace-pre-line prose-invert">
            {message.content}
          </div>
        </div>

        {/* Actionable Game Navigation Buttons */}
        {isAssistant && actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => handleGameAction(act.target)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1.5 border border-sky-500/30 shadow-md transition-all"
              >
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>{act.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
