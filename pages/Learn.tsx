import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage, TranslationSet, LearnTopic } from '../types.ts';
import { LEARN_TOPICS } from '../constants.tsx';
import { generateTopicImage, fetchTTSBuffer, getAudioCtx } from '../geminiService.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const Learn: React.FC<Props> = ({ lang, t }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);
  const [topicImages, setTopicImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Audio State
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return LEARN_TOPICS;
    return LEARN_TOPICS.filter(topic => 
      topic.title.toLowerCase().includes(q) || 
      topic.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const loadTopicImage = async (topic: LearnTopic, force = false) => {
    setLoadingImages(prev => ({ ...prev, [topic.id]: true }));
    try {
      // If forcing, we bypass the static fallback to ensure AI is triggered
      const img = await generateTopicImage(
        topic.prompt, 
        topic.id, 
        topic.detailedContent, 
        force ? undefined : topic.image
      );
      setTopicImages(prev => ({ ...prev, [topic.id]: img }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImages(prev => ({ ...prev, [topic.id]: false }));
    }
  };

  useEffect(() => {
    LEARN_TOPICS.forEach(topic => {
      if (!topicImages[topic.id] && !loadingImages[topic.id]) {
        loadTopicImage(topic);
      }
    });
  }, []);

  const playAudio = async (topic: LearnTopic) => {
    hapticTap();
    const ctx = getAudioCtx();
    setAudioState('loading');
    try {
      const textToSpeak = `${topic.title}. ${topic.detailedContent}`;
      const buffer = await fetchTTSBuffer(textToSpeak, lang);
      if (!buffer) return;
      audioBufferRef.current = buffer;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      audioSourceRef.current = source;
      setAudioState('playing');
    } catch (e) {
      setAudioState('idle');
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setAudioState('idle');
  };

  const handleBack = () => {
    stopAudio();
    setSelectedTopic(null);
  };

  const handleTopicSelect = async (topic: LearnTopic) => {
    hapticTap();
    setSelectedTopic(topic);
    try {
      await fetch('/api/track/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: topic.id })
      });
    } catch (e) {
      console.warn("Topic tracking failed", e);
    }
  };

  if (selectedTopic) {
    const isAiImage = topicImages[selectedTopic.id]?.startsWith('data:image');
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-24">
        <button onClick={handleBack} className="flex items-center gap-3 text-[#135bec] font-black text-2xl p-2 active:bg-blue-50 rounded-xl transition-all">
          <span className="material-symbols-outlined text-3xl">arrow_back</span> Back
        </button>

        <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-slate-200 aspect-video">
          {loadingImages[selectedTopic.id] ? (
            <div className="absolute inset-0 shimmer-bg flex flex-col items-center justify-center">
               <span className="material-symbols-outlined text-6xl text-slate-300 animate-spin">sync</span>
               <p className="text-sm font-black uppercase text-slate-500 mt-4 tracking-widest">Developing AI Photo...</p>
            </div>
          ) : (
            <>
              <img src={topicImages[selectedTopic.id] || selectedTopic.image} alt={selectedTopic.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {!isAiImage && (
                <button 
                  onClick={() => loadTopicImage(selectedTopic, true)}
                  className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full text-xs font-black text-[#135bec] shadow-xl flex items-center gap-2 active:scale-95 border border-blue-100"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span> Fix Irrelevant Image
                </button>
              )}
            </>
          )}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-[#135bec] text-white px-6 py-2 rounded-full text-xs font-black uppercase shadow-lg">{selectedTopic.category}</div>
            {isAiImage && (
              <div className="bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-xs filled">verified</span> AI GENERATED
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl space-y-6">
          <div className="flex items-center justify-center gap-6">
            {audioState === 'playing' ? (
              <button onClick={stopAudio} className="size-28 rounded-[2.5rem] bg-amber-500 text-white shadow-xl flex items-center justify-center active:scale-95"><span className="material-symbols-outlined text-7xl">stop</span></button>
            ) : (
              <button onClick={() => playAudio(selectedTopic)} disabled={audioState === 'loading'} className={`size-28 rounded-[2.5rem] text-white shadow-xl flex items-center justify-center active:scale-95 ${audioState === 'loading' ? 'bg-slate-300 animate-pulse' : 'bg-[#135bec]'}`}><span className="material-symbols-outlined text-7xl">play_arrow</span></button>
            )}
          </div>
          <h2 className="text-4xl font-black text-center dark:text-white">{selectedTopic.title}</h2>
          <div className="space-y-6">
             {selectedTopic.detailedContent.split('. ').map((p, i) => <p key={i} className="text-2xl leading-relaxed font-bold text-gray-800 dark:text-gray-200">{p}.</p>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-28">
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
        {filteredTopics.map((topic, idx) => {
          const isAiImage = topicImages[topic.id]?.startsWith('data:image');
          return (
            <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl overflow-hidden border-4 border-transparent hover:border-[#135bec] transition-all flex flex-col group animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="relative h-72 w-full bg-slate-100 dark:bg-slate-900">
                {loadingImages[topic.id] ? (
                  <div className="absolute inset-0 shimmer-bg flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 animate-spin">sync</span>
                    <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Developing...</p>
                  </div>
                ) : (
                  <>
                    <img src={topicImages[topic.id] || topic.image} className="w-full h-full object-cover" alt={topic.title} referrerPolicy="no-referrer" />
                    {!isAiImage && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); loadTopicImage(topic, true); }}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[8px] font-black text-[#135bec] shadow-lg flex items-center gap-1.5 border border-blue-50"
                      >
                        <span className="material-symbols-outlined text-xs">auto_awesome</span> REGENERATE
                      </button>
                    )}
                  </>
                )}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-[#135bec] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">{topic.category}</div>
                  {isAiImage && <div className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-[10px] filled">verified</span>AI GENERATED</div>}
                </div>
              </div>
              <div className="p-10 space-y-6">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">{topic.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold leading-tight line-clamp-2 italic">{topic.summary}</p>
                <button onClick={() => handleTopicSelect(topic)} className="w-full py-6 bg-blue-50 dark:bg-blue-900/30 text-[#135bec] rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 border-2 border-[#135bec]/10">Read Story</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learn;
