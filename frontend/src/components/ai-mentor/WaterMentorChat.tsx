import React, { useState, useRef, useEffect } from 'react';
import { MentorMessage } from './MentorMessage';
import { MentorSuggestions } from './MentorSuggestions';
import { aiMentorService, MentorChatMessage, MentorAction } from '../../services/aiMentor.service';
import { useGameStore } from '../../store/gameStore';
import { Send, RefreshCw, Trash2, Database, Bot } from 'lucide-react';

export const WaterMentorChat: React.FC = () => {
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const latestResult = useGameStore((state) => state.latestSimulationResult);

  const [messages, setMessages] = useState<MentorChatMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      content: `Namaste young scientist! I am your **JalRakshak AI Water Mentor**.\n\nI am here to help you understand how rainfall, artificial recharge structures, and agricultural irrigation impact the aquifer under **${groundwaterData.villageName}**.\n\nYou can ask me any science questions, or ask me to explain your latest simulation results!`,
      timestamp: new Date().toISOString(),
      provider: 'educational-engine',
      isAiGenerated: false
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeActions, setActiveActions] = useState<MentorAction[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: MentorChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiMentorService.sendMessage({
        message: text,
        villageId: groundwaterData.villageId,
        includeSimulationContext: true
      });

      const mentorMsg: MentorChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        provider: response.provider,
        isAiGenerated: response.isAiGenerated,
        hydroContext: response.hydroContext
      };

      setMessages((prev) => [...prev, mentorMsg]);
      if (response.recommendedActions) {
        setActiveActions(response.recommendedActions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history cleared. What would you like to investigate next about groundwater conservation?',
        timestamp: new Date().toISOString(),
        provider: 'educational-engine',
        isAiGenerated: false
      }
    ]);
    setActiveActions([]);
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 flex flex-col flex-1 h-[78vh] shadow-2xl border border-sky-500/30 overflow-hidden">
      {/* Context Indicator Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Active Context:</span>
          <span className="font-bold text-white">{groundwaterData.villageName}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Storage: {groundwaterData.metrics.storagePercentage}% ({groundwaterData.metrics.conditionCategory})
          </span>
          {latestResult && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
              Latest Sim: Score {latestResult.sustainability.overallScore}/100
            </span>
          )}
        </div>

        <button
          onClick={handleClear}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-2">
        {messages.map((m, idx) => (
          <MentorMessage
            key={m.id}
            message={m}
            actions={idx === messages.length - 1 ? activeActions : undefined}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-3 my-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="glass-panel p-3.5 rounded-2xl text-xs text-sky-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing hydrological models and preparing explanation...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Starter Suggestions */}
      {messages.length < 3 && (
        <MentorSuggestions onSelectSuggestion={(q) => handleSend(q)} disabled={loading} />
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-700/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g., 'Explain my latest simulation' or 'Why is drip irrigation better?')..."
          className="flex-1 bg-slate-900/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:border-sky-400 transition-colors"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/25 disabled:opacity-40 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
