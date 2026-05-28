import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage, TranslationSet, LearnTopic } from '../types.ts';
import { LEARN_TOPICS } from '../constants.tsx';
import { getLearnTopicContent, speakText } from '../geminiService.ts';
import { hapticTap } from '../utils.ts';
import { useAudioPreloader } from '../useAudioPreloader.ts';
import { CivicQuiz } from '../components/CivicQuiz.tsx';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const getCategoryBorderClass = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('tech')) return 'border-l-blue-600 dark:border-l-blue-500';
  if (c.includes('fin')) return 'border-l-emerald-600 dark:border-l-emerald-500';
  if (c.includes('over')) return 'border-l-teal-600 dark:border-l-teal-500';
  if (c.includes('leg')) return 'border-l-amber-600 dark:border-l-amber-500';
  if (c.includes('right')) return 'border-l-orange-500 dark:border-l-orange-400';
  if (c.includes('rep')) return 'border-l-violet-600 dark:border-l-violet-500';
  if (c.includes('equal')) return 'border-l-pink-600 dark:border-l-pink-500';
  if (c.includes('acc')) return 'border-l-rose-600 dark:border-l-rose-500';
  if (c.includes('dev')) return 'border-l-cyan-600 dark:border-l-cyan-500';
  if (c.includes('peace')) return 'border-l-green-600 dark:border-l-green-500';
  if (c.includes('date')) return 'border-l-slate-600 dark:border-l-slate-500';
  if (c.includes('proc')) return 'border-l-indigo-600 dark:border-l-indigo-500';
  if (c.includes('verif')) return 'border-l-sky-600 dark:border-l-sky-500';
  if (c.includes('safe')) return 'border-l-red-600 dark:border-l-red-500';
  if (c.includes('plan')) return 'border-l-fuchsia-600 dark:border-l-fuchsia-500';
  return 'border-l-[#135bec]';
};

const LearnCard: React.FC<{
  topic: LearnTopic;
  idx: number;
  lang: AppLanguage;
  onSelect: (topic: any) => void;
  langCode: string;
  featured?: boolean;
}> = ({ topic, idx, lang, onSelect, langCode, featured = false }) => {
  const [content, setContent] = useState<{ summary: string; detailed: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string>(topic.image);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  const textToSpeak = content ? `${content.summary}. ${content.detailed}` : null;
  const { play, isReady, isPreloading, isPlaying } = useAudioPreloader(textToSpeak, lang);

  // Fix 1: Staggered Loading & LocalStorage Caching (7-day TTL)
  useEffect(() => {
    const cacheKey = `sauti_learn_${topic.id}_${lang}`;
    let cached: string | null = null;
    try {
      cached = localStorage.getItem(cacheKey);
    } catch (storageErr) {
      console.warn("localStorage.getItem failed inside Learn.tsx:", storageErr);
    }
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < sevenDays) {
          setContent(data);
          setLoading(false);
          return;
        }
      } catch (jsonErr) {
        console.warn("Failed to parse cached learn topic:", jsonErr);
      }
    }

    const timer = setTimeout(async () => {
      try {
        const enriched = await getLearnTopicContent(topic.title, topic.detailedContent, lang);
        setContent(enriched);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: enriched, timestamp: Date.now() }));
        } catch (setErr) {
          console.warn("localStorage.setItem failed inside Learn.tsx:", setErr);
        }
      } catch (e) {
        setContent({ summary: topic.summary, detailed: topic.detailedContent });
      } finally {
        setLoading(false);
      }
    }, idx * 500); // 500ms staggered delay

    return () => clearTimeout(timer);
  }, [topic.id, lang, idx]);

  // Note: We no longer generate topic images via AI as per user request.
  // topic.image static paths are used directly.
  useEffect(() => {
    setImageLoading(false);
  }, [topic.id]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticTap();
    play();
  };

  const borderClass = getCategoryBorderClass(topic.category);

  return (
    <div 
      ref={cardRef}
      className={`bg-[#fafaf8] dark:bg-slate-900 rounded-[3rem] shadow-[0_15px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.25)] border-l-[6px] ${borderClass} overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group animate-in slide-in-from-bottom-8 duration-700 ${featured ? 'scale-100 ring-2 ring-[#135bec]/10' : 'scale-[0.98]'}`}
    >
      {/* Blurred Image Backdrop Header */}
      <div className={`relative ${featured ? 'h-80' : 'h-64'} w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center`}>
        {!imageError && !imageLoading && (
          <img 
            src={image} 
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 dark:opacity-50 scale-125 select-none pointer-events-none" 
            alt="" 
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Soft dark vignette gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Foreground beautifully framed image */}
        <div className="relative z-10 w-[92%] h-[85%] rounded-[2rem] overflow-hidden shadow-xl border border-white/20 dark:border-white/10">
          {imageLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-700">
              <span className="material-symbols-outlined text-5xl animate-pulse">image</span>
            </div>
          ) : (
            <img 
              src={image} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt={topic.title} 
              onError={() => setImageError(true)}
            />
          )}
          {imageError && !imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
               <span className="text-5xl">🇰🇪</span>
            </div>
          )}
        </div>

        {/* Floating Category Tag inside Header */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
          {featured && (
            <span className="bg-[#135bec] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
              <span className="material-symbols-outlined text-xs filled !text-white">star</span>
              FEATURED STUDY
            </span>
          )}
          <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-slate-200/50 dark:border-slate-800">
            {topic.category}
          </div>
        </div>

        {/* Instant Play Button */}
        <button 
          onClick={handlePlayClick}
          disabled={isPreloading && !isReady}
          className={`absolute bottom-6 right-8 z-20 size-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all duration-300 ${isReady ? 'bg-white text-[#135bec] dark:bg-slate-900 dark:text-blue-400' : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'}`}
        >
          {isPreloading && !isReady ? (
            <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
          ) : isPlaying ? (
            <span className="material-symbols-outlined text-3xl">stop</span>
          ) : (
            <span className="material-symbols-outlined text-3xl">{isReady ? 'play_arrow' : 'volume_up'}</span>
          )}
        </button>
      </div>

      <div className="p-10 space-y-6">
        <h3 className={`${featured ? 'text-5xl' : 'text-4xl'} font-black text-slate-900 dark:text-white leading-tight tracking-tighter`}>{topic.title}</h3>
        
        {loading ? (
          <div className="space-y-4 animate-pulse py-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-11/12 shadow-sm"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5 shadow-sm"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 shadow-sm"></div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 text-2xl font-bold leading-tight line-clamp-2 italic">
            {content?.summary || topic.summary}
          </p>
        )}

        <button 
          onClick={() => onSelect({ ...topic, detailedContent: content?.detailed || topic.detailedContent })} 
          className={`w-full py-6 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${
            featured 
              ? 'bg-[#135bec] text-white shadow-xl hover:bg-blue-700' 
              : 'bg-blue-50/70 dark:bg-slate-800 text-[#135bec] dark:text-blue-400 border-2 border-[#135bec]/10'
          }`}
          disabled={loading}
        >
          {loading ? 'Initializing...' : 'Read Story'}
        </button>
      </div>
    </div>
  );
};

const Learn: React.FC<Props> = ({ lang, t }) => {
  const [subTab, setSubTab] = useState<'academy' | 'quiz'>('academy');
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return LEARN_TOPICS;
    return LEARN_TOPICS.filter(topic => 
      topic.title.toLowerCase().includes(q) || 
      topic.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleBack = () => setSelectedTopic(null);

  if (selectedTopic) {
    const textToSpeak = `${selectedTopic.title}. ${selectedTopic.detailedContent}`;
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-24">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-3 text-[#135bec] font-black text-2xl p-2 active:bg-blue-50 rounded-xl transition-all">
            <span className="material-symbols-outlined text-3xl">arrow_back</span> Back
          </button>
          <button 
            onClick={() => { hapticTap(); speakText(textToSpeak, lang); }}
            className="flex items-center gap-2 bg-[#135bec] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">volume_up</span>
            Listen to Article
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl space-y-6">
          <h2 className="text-4xl font-black text-center dark:text-white">{selectedTopic.title}</h2>
          <div className="space-y-6">
             {selectedTopic.detailedContent.split('. ').map((p: string, i: number) => (
                <p key={i} className="text-2xl leading-relaxed font-bold text-gray-800 dark:text-gray-200">{p}.</p>
             ))}
          </div>
          <p className="text-sm text-center text-slate-400 italic mt-8 tracking-widest font-black uppercase">
             Kenya Civic Knowledge Hub • Official Update
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-28">
      {/* Premium Segment Control Tab Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-3xl gap-2 font-sans border border-slate-200/50 dark:border-slate-800">
        <button 
          onClick={() => { hapticTap(); setSubTab('academy'); }}
          className={`flex-1 py-4 px-3 rounded-2xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${subTab === 'academy' ? 'bg-[#135bec] text-white shadow-lg' : 'text-slate-500'}`}
        >
          <span className="material-symbols-outlined text-lg">school</span>
          Academy
        </button>
        <button 
          onClick={() => { hapticTap(); setSubTab('quiz'); }}
          className={`flex-1 py-4 px-3 rounded-2xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${subTab === 'quiz' ? 'bg-[#135bec] text-white shadow-lg' : 'text-slate-500'}`}
        >
          <span className="material-symbols-outlined text-lg">workspace_premium</span>
          Quiz Hub
        </button>
      </div>

      {subTab === 'academy' && (
        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <h2 className="text-5xl font-black mb-1 tracking-tighter uppercase italic">Civic Academy</h2>
            <p className="text-2xl opacity-80 font-bold italic text-blue-300">Wisdom for our Elders.</p>
            <span className="absolute -right-10 -bottom-10 material-symbols-outlined text-[15rem] opacity-5 rotate-12">school</span>
          </div>

          <div className="px-2">
            <input 
              type="text" 
              placeholder="Search for a topic..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full px-10 py-8 bg-white dark:bg-gray-800 border-4 border-slate-100 rounded-[3rem] text-2xl font-black shadow-xl outline-none focus:border-[#135bec] transition-all dark:text-white" 
            />
          </div>

          <div className="grid grid-cols-1 gap-10 px-2">
            {filteredTopics.map((topic, idx) => (
              <LearnCard 
                key={topic.id} 
                topic={topic} 
                idx={idx} 
                lang={lang} 
                langCode={lang} 
                onSelect={setSelectedTopic}
                featured={idx === 0 && searchQuery.trim() === ''}
              />
            ))}
          </div>
        </div>
      )}

      {subTab === 'quiz' && (
        <CivicQuiz lang={lang} t={t} />
      )}
    </div>
  );
};

export default Learn;
