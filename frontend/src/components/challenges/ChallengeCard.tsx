import React, { useState } from 'react';
import { Challenge } from '../../types/gamification';
import { ChallengeTimer } from './ChallengeTimer';
import { challengeService } from '../../services/challenge.service';
import { useGameStore } from '../../store/gameStore';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Zap, 
  CheckCircle2, 
  Play, 
  Compass, 
  AlertCircle 
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoined: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoined }) => {
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const showRewardToast = useGameStore((state) => state.showRewardToast);

  const handleJoin = async () => {
    if (challenge.isJoined) return;
    setJoining(true);
    setErrorMsg('');
    const res = await challengeService.joinChallenge(challenge.id);
    setJoining(false);

    if (res.success) {
      showRewardToast(25, `Joined Quest: ${challenge.title}`);
      onJoined();
    } else {
      setErrorMsg(res.message);
    }
  };

  const isDaily = challenge.challengeType === 'DAILY';

  return (
    <div
      className={`glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all border ${
        challenge.isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : isExpired
          ? 'opacity-50 border-slate-800 bg-slate-900/30'
          : challenge.isJoined
          ? 'border-amber-500/40 bg-amber-950/15 shadow-xl'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDaily
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              {challenge.challengeType} QUEST
            </span>
            {challenge.isJoined && !challenge.isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Enrolled
              </span>
            )}
          </div>

          <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            +{challenge.xpReward} XP
          </span>
        </div>

        {/* Challenge Title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {challenge.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Timer & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <ChallengeTimer
          endDate={challenge.endDate}
          onExpire={() => setIsExpired(true)}
        />

        {errorMsg && (
          <div className="w-full text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {challenge.isCompleted ? (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Completed & Claimed
            </span>
          ) : isExpired ? (
            <span className="text-xs text-slate-500 font-semibold">
              Quest Period Ended
            </span>
          ) : challenge.isJoined ? (
            <Link
              to="/"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Continue in 3D Village</span>
            </Link>
          ) : (
            <button
              disabled={joining}
              onClick={handleJoin}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{joining ? 'Enrolling...' : 'Join Quest'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
