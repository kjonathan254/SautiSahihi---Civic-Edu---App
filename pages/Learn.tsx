import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppLanguage, TranslationSet, LearnTopic } from '../types.ts';
import { LEARN_TOPICS } from '../constants.tsx';
import { generateTopicImage, fetchTTSBuffer, getAudioCtx, getLearnTopicContent, fetchTTSBase64, bufferFromBase64 } from '../geminiService.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const LearnCard: React.FC<{
  topic: LearnTopic;
  idx: number;
  lang: AppLanguage;
  onSelect: (topic: any) => void;
  langCode: string;
}> = ({ topic, idx, lang, onSelect, langCode }) => {
  const [content, setContent] = useState<{ summary: string; detailed: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string>(topic.image);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const audioBlobRef = useRef<AudioBuffer | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // Fix 1: Staggered Loading & LocalStorage Caching (7-day TTL)
  useEffect(() => {
    const cacheKey = `sauti_learn_${topic.id}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < sevenDays) {
        setContent(data);
        setLoading(false);
        return;
      }
    }

    const timer = setTimeout(async () => {
      try {
        const enriched = await getLearnTopicContent(topic.title, topic.detailedContent, lang);
        setContent(enriched);
        localStorage.setItem(cacheKey, JSON.stringify({ data: enriched, timestamp: Date.now() }));
      } catch (e) {
        setContent({ summary: topic.summary, detailed: topic.detailedContent });
      } finally {
        setLoading(false);
      }
    }, idx * 500); // 500ms staggered delay

    return () => clearTimeout(timer);
  }, [topic.id, lang, idx]);

  // Fix 2: NVIDIA Image Generation with Placeholder & Fade-in
  useEffect(() => {
    const fetchImage = async () => {
      setImageLoading(true);
      try {
        const aiImage = await generateTopicImage(topic.prompt, topic.id, topic.detailedContent);
        if (aiImage) setImage(aiImage);
      } catch (e) {
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };
    fetchImage();
  }, [topic.id, topic.prompt]);

  // Fix 3: Audio Pre-generation with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !audioBlobRef.current && !audioLoading && content) {
          const sessionKey = `sauti_audio_${topic.id}_${lang}`;
          const cachedAudio = sessionStorage.getItem(sessionKey);
          
          if (cachedAudio) {
            const buffer = await bufferFromBase64(cachedAudio);
            if (buffer) {
              audioBlobRef.current = buffer;
              return;
            }
          }

          setAudioLoading(true);
          try {
            const textToSpeak = `${content.summary}. ${content.detailed}`;
            const b64 = await fetchTTSBase64(textToSpeak, lang);
            if (b64) {
              sessionStorage.setItem(sessionKey, b64);
              const buffer = await bufferFromBase64(b64);
              if (buffer) audioBlobRef.current = buffer;
            }
          } finally {
            setAudioLoading(false);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [content, lang, topic.id]);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticTap();
    if (audioBlobRef.current) {
      const ctx = getAudioCtx();
      const source = ctx.createBufferSource();
      source.buffer = audioBlobRef.current;
      source.connect(ctx.destination);
      source.start(0);
    } else {
       // Still generating, handled by UI spinner on button
    }
  };

  const isAiImage = image?.startsWith('data:image');

  return (
    <div 
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl overflow-hidden border-4 border-transparent hover:border-[#135bec] transition-all flex flex-col group animate-in slide-in-from-bottom-8 duration-700"
    >
      <div className="relative h-72 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {imageLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-700">
            <span className="material-symbols-outlined text-6xl animate-pulse">image</span>
            <p className="text-[10px] font-black uppercase mt-2 tracking-widest text-[#135bec]">Generating Design...</p>
          </div>
        ) : (
          <img 
            src={image} 
            className={`w-full h-full object-cover transition-opacity duration-400 ${imageLoading ? 'opacity-0' : 'opacity-100'}`} 
            alt={topic.title} 
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Placeholder on failure */}
        {imageError && !imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
             <span className="text-6xl">🇰🇪</span>
          </div>
        )}

        <div className="absolute top-6 left-6 flex flex-col gap-3">
          <div className="bg-[#135bec] text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl border-2 border-white/20">{topic.category}</div>
          {isAiImage && <div className="bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 w-fit border-2 border-white/20"><span className="material-symbols-outlined text-xs filled">verified</span>AI GENERATED</div>}
        </div>

        {/* Instant Play Button */}
        <button 
          onClick={handlePlay}
          className="absolute bottom-6 right-6 size-16 rounded-full bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center text-[#135bec] active:scale-95 transition-transform"
        >
          {audioLoading ? (
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          ) : (
            <span className="material-symbols-outlined text-4xl">{audioBlobRef.current ? 'play_arrow' : 'hourglass_empty'}</span>
          )}
        </button>
      </div>

      <div className="p-10 space-y-6">
        <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">{topic.title}</h3>
        
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-4/6"></div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold leading-tight line-clamp-2 italic">
            {content?.summary || topic.summary}
          </p>
        )}

        <button 
          onClick={() => onSelect({ ...topic, detailedContent: content?.detailed || topic.detailedContent })} 
          className="w-full py-6 bg-blue-50 dark:bg-blue-900/30 text-[#135bec] rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 border-2 border-[#135bec]/10 active:scale-[0.98] transition-all"
        >
          Read Story
        </button>
      </div>
    </div>
  );
};

const Learn: React.FC<Props> = ({ lang, t }) => {
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
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-24">
        <button onClick={handleBack} className="flex items-center gap-3 text-[#135bec] font-black text-2xl p-2 active:bg-blue-50 rounded-xl transition-all">
          <span className="material-symbols-outlined text-3xl">arrow_back</span> Back
        </button>

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
          />
        ))}
      </div>
    </div>
  );
};

export default Learn;
