import React, { useState } from 'react';
import { MissionTask } from '../../types/gamification';
import { missionService } from '../../services/mission.service';
import { useGameStore } from '../../store/gameStore';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Award, 
  HelpCircle, 
  AlertCircle, 
  Cpu, 
  Sparkles,
  Droplet
} from 'lucide-react';

interface MissionTaskListProps {
  missionId: string;
  tasks: MissionTask[];
  onTaskCompleted: () => void;
}

export const MissionTaskList: React.FC<MissionTaskListProps> = ({
  missionId,
  tasks,
  onTaskCompleted,
}) => {
  const latestSimulationResult = useGameStore((state) => state.latestSimulationResult);
  const setSimulationModalOpen = useGameStore((state) => state.setSimulationModalOpen);
  const applyAuthoritativeReward = useGameStore((state) => state.applyAuthoritativeReward);

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ [taskId: string]: string }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({
    q1: 'ORGANIC_FARMING',
    q2: 'FRESH_RECHARGE_DILUTION',
    q3: 'DEEP_MINERAL_LEACHING',
  });

  const handleCompleteSimulationTask = async (task: MissionTask) => {
    if (!latestSimulationResult) {
      setErrorMessage((prev) => ({
        ...prev,
        [task.id]: 'Please run a simulation in the 3D village first to generate verification data.',
      }));
      setSimulationModalOpen(true);
      return;
    }

    setSubmittingTaskId(task.id);
    setErrorMessage((prev) => ({ ...prev, [task.id]: '' }));

    // Prepare authoritative simulation payload for server-side evaluation
    const submission = {
      simulationId: latestSimulationResult.simulationId,
      villageId: (latestSimulationResult as any).villageId || '123e4567-e89b-12d3-a456-426614174000',
      waterBalance: latestSimulationResult.waterBalance,
      storagePercentage: latestSimulationResult.waterBalance.storagePercentage,
      sustainability: latestSimulationResult.sustainability,
      sustainabilityScore: latestSimulationResult.sustainability.overallScore,
      sectors: latestSimulationResult.sectors,
      waterQuality: latestSimulationResult.waterQuality,
      conservationStructures: latestSimulationResult.interventions?.deployed
        ? Object.keys(latestSimulationResult.interventions.deployed)
        : [],
      scenarioId: latestSimulationResult.scenarioId || 'DEFAULT',
    };

    const res = await missionService.completeTask(missionId, task.id, submission);
    setSubmittingTaskId(null);

    if (res.taskPassed) {
      applyAuthoritativeReward(task.xpReward, `Completed Task: ${task.title}`);
      onTaskCompleted();
    } else {
      setErrorMessage((prev) => ({
        ...prev,
        [task.id]: res.message || 'Criteria not met by recent simulation run.',
      }));
    }
  };

  const handleCompleteQuizTask = async (task: MissionTask) => {
    setSubmittingTaskId(task.id);
    setErrorMessage((prev) => ({ ...prev, [task.id]: '' }));

    const submission = {
      answers: quizAnswers,
    };

    const res = await missionService.completeTask(missionId, task.id, submission);
    setSubmittingTaskId(null);

    if (res.taskPassed) {
      applyAuthoritativeReward(task.xpReward, `Passed Hydrology Quiz: ${task.title}`);
      onTaskCompleted();
    } else {
      setErrorMessage((prev) => ({
        ...prev,
        [task.id]: res.message || 'Quiz submission did not meet passing percentage.',
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span>Mission Action Tasks</span>
        <span>{tasks.filter((t) => t.isCompleted).length} of {tasks.length} Complete</span>
      </div>

      {tasks.map((task, idx) => {
        const isDone = task.isCompleted;
        const isQuiz = task.taskType === 'COMPLETE_QUIZ';
        const isSubmitting = submittingTaskId === task.id;
        const err = errorMessage[task.id];

        return (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all ${
              isDone
                ? 'bg-emerald-950/15 border-emerald-500/40'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      Task {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">{task.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1 shrink-0">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                +{task.xpReward} XP
              </span>
            </div>

            {/* If task is a quiz, display interactive quiz selector */}
            {!isDone && isQuiz && (
              <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                  Hydrology Verification Questions:
                </span>
                
                <div>
                  <p className="text-slate-300 mb-1">1. Primary measure to prevent groundwater agrochemical leaching?</p>
                  <select
                    value={quizAnswers.q1}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, q1: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value="ORGANIC_FARMING">Organic farming with balanced bio-inputs (Correct)</option>
                    <option value="EXCESS_NITROGEN">Heavy nitrogenous fertilizer flooding</option>
                  </select>
                </div>

                <div>
                  <p className="text-slate-300 mb-1">2. How does artificial recharge improve aquifer water quality?</p>
                  <select
                    value={quizAnswers.q2}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, q2: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value="FRESH_RECHARGE_DILUTION">Fresh rainwater infiltration dilutes TDS & nitrates (Correct)</option>
                    <option value="BOILING">Underground boiling of basalt layers</option>
                  </select>
                </div>

                <div>
                  <p className="text-slate-300 mb-1">3. Why does excessive over-draft increase fluoride / salinity?</p>
                  <select
                    value={quizAnswers.q3}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, q3: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value="DEEP_MINERAL_LEACHING">Over-pumping leaches deep mineralization & geogenic salts (Correct)</option>
                    <option value="SURFACE_EVAP">Surface wind evaporation</option>
                  </select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 bg-rose-950/30 p-2 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            {/* Interactive action buttons */}
            {!isDone && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
                {isQuiz ? (
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleCompleteQuizTask(task)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Verifying Answers...' : 'Submit Quiz Answers'}
                  </button>
                ) : (
                  <>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleCompleteSimulationTask(task)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Evaluating Server Math...' : 'Verify with Active Simulation'}
                    </button>

                    <button
                      onClick={() => setSimulationModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Play className="w-3 h-3 text-sky-400" />
                      Launch 3D Simulation Setup
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MissionTaskList;
