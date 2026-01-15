import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage, TranslationSet, LearnTopic } from '../types.ts';
import { LEARN_TOPICS } from '../constants.tsx';
import { generateTopicImage, fetchTTSBuffer, getAudioCtx } from '../geminiService.ts';
import { generateHFImage } from '../hfService.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const Learn: React.FC<Props> = ({ lang, t }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null);
  const [topicImages, setTopicImages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Poster State (Hugging Face)
  const [posterPrompt, setPosterPrompt] = useState('');
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // Audio State
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const audioStateRef = useRef(audioState);
  useEffect(() => {
    audioStateRef.current = audioState;
  }, [audioState]);

  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  const [generatingBadge, setGeneratingBadge] = useState(false);
  const [badgeImage, setBadgeImage] = useState<string | null>(null);

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return LEARN_TOPICS;
    return LEARN_TOPICS.filter(topic => 
      topic.title.toLowerCase().includes(q) || 
      topic.summary.toLowerCase().includes(q) ||
      topic.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const loadImages = async () => {
      for (const topic of LEARN_TOPICS) {
        try {
          // Passing topic.detailedContent as context for better prompt generation
          const img = await generateTopicImage(topic.prompt, topic.id, topic.detailedContent, topic.image);
          setTopicImages(prev => ({ ...prev, [topic.id]: img }));
        } catch (e) {
          setTopicImages(prev => ({ ...prev, [topic.id]: topic.image }));
        }
      }
    };
    loadImages();
    return () => stopAudio();
  }, []);

  const handleCreatePoster = async () => {
    if (!posterPrompt.trim()) return;
    hapticTap();
    setIsGeneratingPoster(true);
    setGeneratedPoster(null);
    try {
      const fullPrompt = `A high-quality, photorealistic civic poster for Kenya: ${posterPrompt}. Dignified, cinematic lighting, sharp details.`;
      const imageUrl = await generateHFImage(fullPrompt);
      setGeneratedPoster(imageUrl);
      hapticSuccess();
    } catch (e) {
      console.error(e);
      hapticWarning();
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      if (audioBufferRef.current && audioStateRef.current === 'playing') {
        const elapsed = getAudioCtx().currentTime - startTimeRef.current + offsetRef.current;
        const progress = (elapsed / audioBufferRef.current.duration) * 100;
        setPlaybackProgress(Math.min(progress, 100));
        if (progress >= 100) stopAudio();
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const playAudio = async (topic: LearnTopic) => {
    hapticTap();
    const ctx = getAudioCtx();

    if (audioState === 'paused' && audioBufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(ctx.destination);
      source.onended = () => { if (audioStateRef.current === 'playing') stopAudio(); };
      
      startTimeRef.current = ctx.currentTime;
      source.start(0, offsetRef.current);
      audioSourceRef.current = source;
      setAudioState('playing');
      startProgressTracking();
      return;
    }

    setAudioState('loading');
    try {
      const textToSpeak = `${topic.title}. ${topic.detailedContent}`;
      const buffer = await fetchTTSBuffer(textToSpeak);
      if (!buffer) throw new Error("No buffer received");

      audioBufferRef.current = buffer;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => { if (audioStateRef.current === 'playing') stopAudio(); };

      startTimeRef.current = ctx.currentTime;
      offsetRef.current = 0;
      source.start(0);
      audioSourceRef.current = source;
      
      setAudioState('playing');
      setPlaybackProgress(0);
      startProgressTracking();
      hapticSuccess();
    } catch (error) {
      setAudioState('idle');
      hapticWarning();
    }
  };

  const pauseAudio = () => {
    hapticTap();
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    const elapsed = getAudioCtx().currentTime - startTimeRef.current;
    offsetRef.current += elapsed;
    setAudioState('paused');
    stopProgressTracking();
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    offsetRef.current = 0;
    setAudioState('idle');
    setPlaybackProgress(0);
    stopProgressTracking();
  };

  const handleBack = () => {
    hapticTap();
    stopAudio();
    setSelectedTopic(null);
    setBadgeImage(null);
  };

  const generateBadge = async () => {
    if (!selectedTopic) return;
    hapticTap();
    setGeneratingBadge(true);
    try {
      const prompt = `A highly detailed gold medal for civic mastery, featuring a Kenyan shield and the SautiSahihi logo. Photorealistic, clean white background.`;
      // Pass category context for badge refinement
      const img = await generateTopicImage(prompt, `badge_${selectedTopic.id}`, `A mastery badge for ${selectedTopic.category}`);
      setBadgeImage(img);
      hapticSuccess();
    } catch (e) {
      console.error("Badge generation failed", e);
    } finally {
      setGeneratingBadge(false);
    }
  };

  if (selectedTopic) {
    const isAiImage = topicImages[selectedTopic.id]?.startsWith('data:image');
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 pb-24">
        <button
          onClick={handleBack}
          className="flex items-center gap-3 text-[#135bec] font-black text-2xl mb-4 p-2 active:bg-blue-50 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
          Back to Academy
        </button>

        <div className="relative group rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-slate-100">
          <img
            src={topicImages[selectedTopic.id] || selectedTopic.image}
            alt={selectedTopic.title}
            className="w-full h-80 object-cover"
          />
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-[#135bec] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              {selectedTopic.category}
            </div>
            {isAiImage && (
              <div className="bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs filled">auto_awesome</span>
                AI Visual
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-2 border-blue-50 dark:border-slate-800 space-y-6">
          <div className="flex justify-between items-center px-2">
             <div className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${audioState === 'playing' ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="text-sm font-black uppercase tracking-widest text-slate-500">
                  {audioState === 'loading' ? 'Preparing Voice...' : 
                   audioState === 'playing' ? 'Playing Briefing' : 
                   audioState === 'paused' ? 'Briefing Paused' : 'Audio Briefing Available'}
                </span>
             </div>
             {audioBufferRef.current && (
               <span className="text-xs font-black text-slate-400">
                 {Math.round((playbackProgress / 100) * audioBufferRef.current.duration)}s / {Math.round(audioBufferRef.current.duration)}s
               </span>
             )}
          </div>
          
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-gradient-to-r from-blue-600 to-[#135bec] transition-all duration-300 rounded-full" 
               style={{ width: `${playbackProgress}%` }}
             />
          </div>

          <div className="flex items-center justify-center gap-8 pt-4">
            <button onClick={stopAudio} disabled={audioState === 'idle'} className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 border-2 border-transparent"><span className="material-symbols-outlined text-4xl">stop</span></button>
            {audioState === 'playing' ? (
              <button onClick={pauseAudio} className="size-28 rounded-[2.5rem] bg-amber-500 text-white shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] flex items-center justify-center active:scale-95 transition-all"><span className="material-symbols-outlined text-7xl">pause</span></button>
            ) : (
              <button onClick={() => playAudio(selectedTopic)} disabled={audioState === 'loading'} className={`size-28 rounded-[2.5rem] text-white shadow-[0_20px_40px_-10px_rgba(19,91,236,0.5)] flex items-center justify-center active:scale-95 transition-all ${audioState === 'loading' ? 'bg-slate-300 animate-pulse' : 'bg-[#135bec]'}`}><span className="material-symbols-outlined text-7xl">{audioState === 'loading' ? 'hourglass_top' : 'play_arrow'}</span></button>
            )}
            <button onClick={() => { hapticTap(); stopAudio(); handleBack(); }} className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center active:scale-90 transition-all border-2 border-transparent"><span className="material-symbols-outlined text-4xl">close</span></button>
          </div>
        </div>

        <div className="px-4">
          <h2 className="text-5xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white">{selectedTopic.title}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-10 rounded-[4rem] shadow-xl border-2 border-gray-50 dark:border-gray-700 space-y-8">
          <div className="space-y-6">
             {selectedTopic.detailedContent.split('. ').map((para, i) => (
               <p key={i} className="text-3xl leading-relaxed font-bold text-gray-800 dark:text-gray-200">{para}{para.endsWith('.') ? '' : '.'}</p>
             ))}
          </div>
          
          <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] border-l-8 border-[#135bec] flex items-start gap-4">
            <span className="material-symbols-outlined text-4xl text-[#135bec] filled">lightbulb</span>
            <div className="space-y-1">
              <h4 className="font-black text-[#135bec] uppercase text-xs tracking-[0.2em]">Why this matters</h4>
              <p className="text-xl font-bold italic text-slate-600 dark:text-slate-400">"An informed elder is the guardian of the community."</p>
            </div>
          </div>

          {!badgeImage ? (
            <button onClick={generateBadge} disabled={generatingBadge} className="w-full py-8 bg-emerald-600 text-white rounded-[3rem] font-black text-3xl shadow-xl active:scale-95 transition-transform border-b-8 border-emerald-800">{generatingBadge ? 'AWARDING MASTERY...' : 'I UNDERSTAND THIS'}</button>
          ) : (
            <div className="animate-in zoom-in duration-700 space-y-6 text-center py-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[3rem] border-2 border-dashed border-emerald-300">
               <div className="size-56 mx-auto rounded-full overflow-hidden border-8 border-amber-400 shadow-2xl relative"><img src={badgeImage} alt="Civic Badge" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /></div>
               <div className="space-y-2">
                 <p className="font-black text-emerald-600 text-3xl tracking-tight uppercase">Mastery Unlocked!</p>
                 <p className="text-xl font-bold text-slate-500 italic">You are a champion of {selectedTopic.category}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-28">
      <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-5xl font-black mb-1 tracking-tighter uppercase italic">Civic Academy</h2>
          <p className="text-2xl opacity-80 font-bold italic text-blue-300">Curated Wisdom for our Elders.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 material-symbols-outlined text-[15rem] opacity-5 rotate-12">school</div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-2">
        <div className="relative group">
          <span className="absolute left-8 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#135bec] text-4xl">search</span>
          <input
            type="text"
            placeholder="Search for a topic (e.g., KIEMS, Voting)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-20 pr-8 py-8 bg-white dark:bg-gray-800 border-4 border-slate-100 dark:border-gray-700 rounded-[3rem] text-2xl font-black shadow-xl outline-none focus:border-[#135bec] transition-all dark:text-white placeholder:text-slate-300"
          />
          {searchQuery && (
            <button 
              onClick={() => { hapticTap(); setSearchQuery(''); }}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Hugging Face Poster Studio */}
      <div className="bg-emerald-950 p-10 rounded-[4rem] text-white shadow-2xl border-4 border-emerald-500/20">
        <div className="flex items-center gap-4 mb-6">
           <div className="bg-emerald-600 p-3 rounded-2xl"><span className="material-symbols-outlined text-3xl filled">palette</span></div>
           <div>
              <h3 className="text-3xl font-black tracking-tight uppercase">Civic Poster Studio</h3>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Powered by Hugging Face FLUX</p>
           </div>
        </div>
        
        <div className="space-y-4">
           <textarea 
             value={posterPrompt}
             onChange={(e) => setPosterPrompt(e.target.value)}
             placeholder="Describe a poster (e.g., Peaceful voting in Kisumu at sunset)..."
             className="w-full p-6 bg-emerald-900/50 border-2 border-emerald-700/50 rounded-[2.5rem] text-xl font-bold text-white placeholder:text-emerald-700 outline-none focus:border-emerald-500 h-32"
           />
           <button 
             onClick={handleCreatePoster}
             disabled={isGeneratingPoster || !posterPrompt}
             className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl active:scale-95 transition-all border-b-8 border-emerald-800 flex items-center justify-center gap-3"
           >
             {isGeneratingPoster ? (
               <><div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> CREATING POSTER...</>
             ) : (
               <><span className="material-symbols-outlined">auto_awesome</span> GENERATE POSTER</>
             )}
           </button>

           {generatedPoster && (
             <div className="mt-8 animate-in zoom-in duration-500 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
                <img src={generatedPoster} alt="HF Generated Poster" className="w-full aspect-video object-cover" />
                <div className="bg-white p-4 text-center">
                  <p className="text-emerald-900 font-black text-xs uppercase tracking-widest">Share this vision with your community</p>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 px-2">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, idx) => {
            const isAiImage = topicImages[topic.id]?.startsWith('data:image');
            return (
              <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl overflow-hidden border-4 border-transparent hover:border-[#135bec] transition-all flex flex-col group animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="relative h-72 w-full bg-slate-100 dark:bg-slate-900">
                  <img src={topicImages[topic.id] || topic.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={topic.title} />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="bg-white/95 dark:bg-gray-900/95 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#135bec] shadow-xl border border-blue-50">{topic.category}</div>
                    {isAiImage && (
                      <div className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/20 flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-[10px] filled">auto_awesome</span>AI Visual</div>
                    )}
                  </div>
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">{topic.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold leading-tight line-clamp-2 italic">{topic.summary}</p>
                  </div>
                  <button onClick={() => { hapticTap(); setSelectedTopic(topic); }} className="w-full py-6 bg-blue-50 dark:bg-blue-900/30 text-[#135bec] rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform border-2 border-[#135bec]/10">Read Story<span className="material-symbols-outlined text-3xl">arrow_forward_ios</span></button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 px-10 space-y-6 opacity-40">
            <span className="material-symbols-outlined text-[10rem]">manage_search</span>
            <div className="space-y-2">
              <p className="text-3xl font-black uppercase tracking-tight">No topics found</p>
              <p className="text-xl font-bold italic">Try searching for something else, like "Voter" or "Kit".</p>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[#135bec] font-black text-2xl underline underline-offset-8"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
