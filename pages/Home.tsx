
import React, { useState, useEffect } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { getLiveNewsSummary, speakText, generateTopicImage } from '../geminiService.ts';
import { hapticTap, hapticSuccess } from '../utils.ts';
import { ELECTION_MOODS, IEBC_HQ_INFO, VOTERS_CHARTER } from '../constants.tsx';

/**
 * SautiLogo - The "Mic-Bubble" brand asset
 */
const SautiLogo: React.FC<{ size?: string; className?: string }> = ({ size = "100%", className = "" }) => (
  <svg viewBox="0 0 400 400" className={className} style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="bubbleGradHero" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#FF0000', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#006400', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path 
      d="M200 50 C290 50 360 110 360 185 C360 260 290 320 200 320 L160 360 L165 320 C90 315 40 260 40 185 C40 110 110 50 200 50 Z" 
      fill="url(#bubbleGradHero)"
    />
    <g transform="translate(160, 120) scale(1.1)">
      <rect x="24" y="0" width="32" height="60" rx="16" fill="white" />
      <path d="M12 25 Q12 65 40 65 Q68 65 68 25" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <rect x="36" y="65" width="8" height="20" fill="white" />
      <rect x="20" y="85" width="40" height="6" rx="3" fill="white" />
      <path d="M5 25 Q-5 40 5 55" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M75 25 Q85 40 75 55" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </g>
  </svg>
);

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
  onNavigate: (tab: string) => void;
}

const Home: React.FC<Props> = ({ lang, t, onNavigate }) => {
  const [news, setNews] = useState('');
  const [activeMood, setActiveMood] = useState(ELECTION_MOODS[0].id);
  const [isReadingNews, setIsReadingNews] = useState(false);
  
  // Hero Image Generation State
  const [heroImages, setHeroImages] = useState<Record<string, string>>({});
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const summary = await getLiveNewsSummary(lang);
        setNews(summary);
      } catch (err) {
        setNews("Stay informed with SautiSahihi. We are monitoring official sources for you.");
      }
    };
    fetchNews();
  }, [lang]);

  useEffect(() => {
    const fetchHeroImage = async () => {
      if (heroImages[activeMood]) return;
      const moodObj = ELECTION_MOODS.find(m => m.id === activeMood);
      if (!moodObj) return;
      setIsGeneratingHero(true);
      try {
        const img = await generateTopicImage(moodObj.prompt);
        setHeroImages(prev => ({ ...prev, [activeMood]: img }));
      } catch (err) {
        console.error("Failed to generate hero image", err);
      } finally {
        setIsGeneratingHero(false);
      }
    };
    fetchHeroImage();
  }, [activeMood]);

  const handleMoodChange = (moodId: string) => {
    hapticTap();
    setActiveMood(moodId);
  };

  const handleListenToNews = async () => {
    if (!news || isReadingNews) return;
    hapticTap();
    setIsReadingNews(true);
    try {
      await speakText(news);
      hapticSuccess();
    } catch (err) {
      console.error("Speech failed", err);
    } finally {
      setIsReadingNews(false);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    const isMorning = hours >= 5 && hours < 12;
    const isAfternoon = hours >= 12 && hours < 17;
    const greetings: Record<'morning' | 'afternoon' | 'evening', Record<AppLanguage, string>> = {
      morning: { ENG: "Good Morning", KIS: "Habari za asubuhi", GIK: "Wia mwega", DHO: "Oyawore", LUH: "Busiere" },
      afternoon: { ENG: "Good Afternoon", KIS: "Habari za mchana", GIK: "Muthenya mwega", DHO: "Osaore", LUH: "Obuire bulahi" },
      evening: { ENG: "Good Evening", KIS: "Habari za jioni", GIK: "Hwai-ini mwega", DHO: "Odhiambo", LUH: "Mwabuka" }
    };
    const timeKey = isMorning ? 'morning' : (isAfternoon ? 'afternoon' : 'evening');
    return greetings[timeKey][lang] || greetings[timeKey]['ENG'];
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20">
      
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-xl border-2 border-white dark:border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-5xl font-black tracking-tighter text-[#135bec]">
            {getGreeting()}
          </h2>
          <p className="text-2xl text-gray-500 dark:text-gray-400 font-bold tracking-tight">{t.welcome}</p>
        </div>
      </section>

      <div className="relative aspect-[16/9] rounded-[4rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-slate-950 border-4 border-white dark:border-slate-800">
        {heroImages[activeMood] ? (
          <img src={heroImages[activeMood]} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isGeneratingHero ? 'opacity-30' : 'opacity-100'}`} alt="Generated Civic Vision" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        {isGeneratingHero && (
          <div className="absolute top-4 right-10 z-20 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
             <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Generating Vision...</span>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4 z-10 text-center">
          <div className="size-20 mb-2 drop-shadow-[0_0_25px_rgba(255,140,0,0.4)]"><SautiLogo /></div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-lg">
              {activeMood === 'queue' && "The Power of Patience"}
              {activeMood === 'ink' && "The Seal of Duty"}
              {activeMood === 'papers' && "Your Choice, Your Voice"}
              {activeMood === 'winner' && "Peaceful Progress"}
            </h1>
            <p className="text-lg font-bold text-blue-300 opacity-90 leading-tight max-w-[85%] mx-auto drop-shadow-md">
              {activeMood === 'queue' && "Queuing together as one Kenya, one people."}
              {activeMood === 'ink' && "Wear your mark of truth with dignity."}
              {activeMood === 'papers' && "Six choices to define our shared future."}
              {activeMood === 'winner' && "Honoring the will of the people in peace."}
            </p>
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/20 w-full max-w-xs justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Clarity</span>
              <div className="h-1 w-8 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Dignity</span>
              <div className="h-1 w-8 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Truth</span>
              <div className="h-1 w-8 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-2 justify-center">
         {ELECTION_MOODS.map(mood => (
           <button key={mood.id} onClick={() => handleMoodChange(mood.id)} className={`flex items-center gap-3 px-6 py-4 rounded-full transition-all border-2 font-black uppercase text-[10px] tracking-widest ${activeMood === mood.id ? 'bg-[#135bec] border-[#135bec] text-white shadow-xl scale-105' : 'bg-white dark:bg-gray-800 border-white dark:border-gray-700 text-gray-400 hover:border-blue-200'}`}>
             <span className="material-symbols-outlined text-lg">{mood.icon}</span>
             {mood.label}
           </button>
         ))}
      </div>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[4rem] border-4 border-[#135bec]/10 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span></span>
              <h3 className="text-3xl font-black tracking-tighter uppercase">{t.latestNews}</h3>
           </div>
           <button onClick={handleListenToNews} disabled={!news || isReadingNews} className={`p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${isReadingNews ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-50 text-[#135bec]'}`}>
             <span className="material-symbols-outlined text-3xl">{isReadingNews ? 'graphic_eq' : 'volume_up'}</span>
           </button>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
          {news ? <p className="text-xl font-bold leading-relaxed text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap">{news}</p> : <div className="space-y-3 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></div>}
        </div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Updated just now • Official Sources</p>
      </section>

      {/* NEW SECTION: The Voter's Charter (Replacing National Pulse) */}
      <section className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl space-y-6 relative overflow-hidden border-4 border-white/10">
        <div className="absolute -right-20 -top-20 size-60 bg-[#135bec] opacity-20 blur-[80px]" />
        <div className="relative z-10 flex items-center justify-between">
           <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase">The Voter's Charter</h3>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{VOTERS_CHARTER.source}</p>
           </div>
           <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
              <span className="material-symbols-outlined text-amber-500 text-xl filled">gavel</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{VOTERS_CHARTER.article}</span>
           </div>
        </div>

        <div className="relative z-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
           <p className="text-2xl font-bold italic leading-relaxed text-blue-50">
             "{VOTERS_CHARTER.content}"
           </p>
        </div>
        
        <div className="relative z-10 flex justify-center">
          <div className="flex gap-4">
             <div className="h-1 w-12 bg-red-600 rounded-full" />
             <div className="h-1 w-12 bg-white rounded-full" />
             <div className="h-1 w-12 bg-emerald-600 rounded-full" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        <button onClick={() => { hapticTap(); onNavigate('fact-checker'); }} className="p-10 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[4rem] shadow-2xl flex items-center gap-8 active:scale-95 transition-all text-left group overflow-hidden relative">
          <div className="size-24 bg-white/20 rounded-[2rem] flex items-center justify-center shrink-0 border-2 border-white/20"><span className="material-symbols-outlined text-6xl filled">fact_check</span></div>
          <div className="space-y-1"><h4 className="font-black text-4xl tracking-tighter">{t.factChecker}</h4><p className="font-bold opacity-90 text-xl italic leading-tight">Identify truth from rumors instantly.</p></div>
        </button>
        <div className="grid grid-cols-2 gap-6">
          <button onClick={() => { hapticTap(); onNavigate('poll'); }} className="p-8 bg-[#135bec] text-white rounded-[4rem] shadow-2xl flex flex-col gap-4 active:scale-95 transition-all text-left"><span className="material-symbols-outlined text-6xl filled">ballot</span><h4 className="font-black text-3xl tracking-tighter">{t.poll}</h4><p className="text-sm font-bold opacity-70">Practice Voting</p></button>
          <button onClick={() => { hapticTap(); onNavigate('learn'); }} className="p-8 bg-emerald-600 text-white rounded-[4rem] shadow-2xl flex flex-col gap-4 active:scale-95 transition-all text-left"><span className="material-symbols-outlined text-6xl filled">school</span><h4 className="font-black text-3xl tracking-tighter">{t.learn}</h4><p className="text-sm font-bold opacity-70">Civic Academy</p></button>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border-4 border-[#135bec]/10 shadow-xl space-y-6">
        <div className="flex items-center gap-4"><div className="bg-[#135bec] p-3 rounded-2xl text-white"><span className="material-symbols-outlined text-3xl filled">account_balance</span></div><div><h3 className="text-3xl font-black tracking-tighter">IEBC Support Desk</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Access</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href={`tel:${IEBC_HQ_INFO.phone}`} className="flex items-center gap-5 p-6 bg-blue-50 dark:bg-slate-800 rounded-3xl border-2 border-transparent hover:border-[#135bec]/20 transition-all"><span className="material-symbols-outlined text-emerald-600 text-4xl">call</span><div><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Call HQ</p><span className="text-2xl font-black text-slate-800 dark:text-white">{IEBC_HQ_INFO.phone}</span></div></a>
          <a href={`https://wa.me/${IEBC_HQ_INFO.whatsapp}`} className="flex items-center gap-5 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border-2 border-transparent hover:border-emerald-500/20 transition-all"><span className="material-symbols-outlined text-emerald-500 text-4xl">chat</span><div><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">WhatsApp</p><span className="text-2xl font-black text-slate-800 dark:text-white">Message</span></div></a>
        </div>
      </section>

      <div className="p-8 bg-slate-900 text-white rounded-[3rem] text-center space-y-4">
         <p className="text-xl font-bold italic opacity-80">"Verified Information for a Dignified Nation."</p>
         <button onClick={() => { hapticTap(); onNavigate('assistant'); }} className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black text-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><span className="material-symbols-outlined text-3xl">psychology</span>Open Civic Assistant</button>
      </div>

    </div>
  );
};

export default Home;
