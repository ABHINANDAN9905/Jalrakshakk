import React from 'react';
import { Sparkles } from 'lucide-react';

interface MentorSuggestionsProps {
  onSelectSuggestion: (question: string) => void;
  disabled?: boolean;
}

const STARTER_QUESTIONS = [
  'Why is our groundwater level decreasing?',
  'Explain my latest simulation.',
  'How can I increase groundwater recharge?',
  'Which irrigation method saves more water?',
  'What happens during a drought?',
  'How can my village improve its sustainability score?'
];

export const MentorSuggestions: React.FC<MentorSuggestionsProps> = ({
  onSelectSuggestion,
  disabled
}) => {
  return (
    <div className="py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        Suggested Hydrological Inquiries
      </span>
      <div className="flex flex-wrap gap-2">
        {STARTER_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onSelectSuggestion(q)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-sky-500/40 text-xs transition-all disabled:opacity-50 text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
