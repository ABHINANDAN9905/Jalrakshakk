import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  selectedPeriod: '7d' | '30d' | '90d' | 'all';
  onSelectPeriod: (period: '7d' | '30d' | '90d' | 'all') => void;
  disabled?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  onSelectPeriod,
  disabled = false
}) => {
  const options: Array<{ id: '7d' | '30d' | '90d' | 'all'; label: string }> = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'all', label: 'All Time' }
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
      <div className="px-2.5 py-1 text-slate-500 flex items-center gap-1.5 font-medium">
        <Calendar className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Range:</span>
      </div>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelectPeriod(opt.id)}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            selectedPeriod === opt.id
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
