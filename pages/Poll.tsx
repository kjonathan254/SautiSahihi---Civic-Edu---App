
import React, { useState, useEffect } from 'react';
import { AppLanguage, TranslationSet, PollResult } from '../types';
import { getLiveNewsSummary } from '../geminiService';
import { hapticTap, hapticSuccess } from '../utils';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const Poll: React.FC<Props> = ({ lang, t }) => {
  const [poll, setPoll] = useState<PollResult>(() => {
    const saved = localStorage.getItem('poll');
    return saved ? JSON.parse(saved) : { coalitionA: 120, movementB: 95, allianceC: 78 };
  });
  const [voted, setVoted] = useState(() => localStorage.getItem('voted') === 'true');
  const [news, setNews] = useState('');
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    localStorage.setItem('poll', JSON.stringify(poll));
    localStorage.setItem('voted', voted.toString());
  }, [poll, voted]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const summary = await getLiveNewsSummary(lang);
        setNews(summary);
      } catch (e) {
        setNews("Unable to load latest news summary.");
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, [lang]);

  const handleVote = (coalition: keyof PollResult) => {
    if (voted) return;
    hapticSuccess();
    setPoll(prev => ({ ...prev, [coalition]: prev[coalition] + 1 }));
    setVoted(true);
  };

  const total = poll.coalitionA + poll.movementB + poll.allianceC;
  const getPercent = (val: number) => Math.round((val / total) * 100);

  return (
    <div className="space-y-8">
      <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">{t.poll}</h2>
        <p className="opacity-90">Practice using a ballot box in our community simulation.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-md border-2 border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-center">Who would you vote for today?</h3>
        
        <div className="space-y-6">
          <VoteCard
            name="Coalition A"
            color="bg-blue-600"
            percent={getPercent(poll.coalitionA)}
            count={poll.coalitionA}
            disabled={voted}
            onVote={() => handleVote('coalitionA')}
            t={t}
          />
          <VoteCard
            name="Movement B"
            color="bg-red-600"
            percent={getPercent(poll.movementB)}
            count={poll.movementB}
            disabled={voted}
            onVote={() => handleVote('movementB')}
            t={t}
          />
          <VoteCard
            name="Alliance C"
            color="bg-amber-600"
            percent={getPercent(poll.allianceC)}
            count={poll.allianceC}
            disabled={voted}
            onVote={() => handleVote('allianceC')}
            t={t}
          />
        </div>

        {voted && (
          <p className="mt-6 text-center text-emerald-600 font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Your practice vote has been counted!
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-[#135bec]">newspaper</span>
          {t.latestNews}
        </h3>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-md border-l-8 border-[#135bec]">
          {loadingNews ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{news}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface VoteCardProps {
  name: string;
  color: string;
  percent: number;
  count: number;
  disabled: boolean;
  onVote: () => void;
  t: TranslationSet;
}

const VoteCard: React.FC<VoteCardProps> = ({ name, color, percent, count, disabled, onVote, t }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end font-bold text-lg">
      <span>{name}</span>
      <span className="text-sm opacity-60">{count} practice votes ({percent}%)</span>
    </div>
    <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
    {!disabled && (
      <button
        onClick={onVote}
        className={`w-full py-3 mt-1 rounded-xl font-bold border-2 transition-all active:scale-95 ${color.replace('bg-', 'border-')} ${color.replace('bg-', 'text-')}`}
      >
        {t.voteNow}
      </button>
    )}
  </div>
);

export default Poll;
