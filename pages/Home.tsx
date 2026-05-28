
import React, { useState, useEffect } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { getLiveNewsSummary, speakText, fastAIResponse } from '../geminiService.ts';
import { hapticTap, hapticSuccess, fileToBase64 } from '../utils.ts';
import { ELECTION_MOODS, IEBC_HQ_INFO, VOTERS_CHARTER } from '../constants.tsx';
import { SeniorFriendlyText } from './Assistant.tsx';

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

const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", 
  "Kakamega", "Nyeri", "Uasin Gishu", "Machakos", "Meru"
];

const Home: React.FC<Props> = ({ lang, t, onNavigate }) => {
  const [news, setNews] = useState('');
  const [activeMood, setActiveMood] = useState(ELECTION_MOODS[0].id);
  const [isReadingNews, setIsReadingNews] = useState(false);
  
  // Hero Image Generation State
  const [heroImages, setHeroImages] = useState<Record<string, string>>({
    'queue': '/images/voter-queue.webp',
    'ink': '/images/seal-of-duty.webp',
    'papers': '/images/your-choice-your-voice.webp',
    'winner': '/images/peaceful-progress.webp'
  });
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);
  
  // Quick Ask State
  const [quickInput, setQuickInput] = useState('');
  const [quickResponse, setQuickResponse] = useState('');
  const [isQuickLoading, setIsQuickLoading] = useState(false);

  // Live Community Hub States
  const [pledges, setPledges] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [communityTab, setCommunityTab] = useState<'pledges' | 'reports'>('pledges');
  const [newPledgeName, setNewPledgeName] = useState('');
  const [newPledgeCounty, setNewPledgeCounty] = useState('Nairobi');
  const [newPledgeText, setNewPledgeText] = useState('I pledge to promote peace and verify facts.');
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCounty, setNewReportCounty] = useState('Nairobi');
  const [newReportCategory, setNewReportCategory] = useState('Voter Education');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportImg, setNewReportImg] = useState<string>('');
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const fetchCommunityData = async () => {
    try {
      const pRes = await fetch('/api/pledges');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPledges(pData);
      }
      const rRes = await fetch('/api/reports');
      if (rRes.ok) {
        const rData = await rRes.json();
        setReports(rData);
      }
    } catch (e) {
      console.error("Failed to fetch community data", e);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleSubmitPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledgeName.trim() || !newPledgeText.trim() || isSubmittingPledge) return;
    hapticTap();
    setIsSubmittingPledge(true);
    try {
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPledgeName,
          county: newPledgeCounty,
          pledgeText: newPledgeText
        })
      });
      if (res.ok) {
        hapticSuccess();
        setNewPledgeName('');
        setNewPledgeText('I pledge to promote peace and verify facts.');
        fetchCommunityData();
      }
    } catch (err) {
      console.error("Pledge failed:", err);
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim() || !newReportDesc.trim() || isSubmittingReport) return;
    hapticTap();
    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newReportTitle,
          county: newReportCounty,
          category: newReportCategory,
          description: newReportDesc,
          image: newReportImg || null
        })
      });
      if (res.ok) {
        hapticSuccess();
        setNewReportTitle('');
        setNewReportDesc('');
        setNewReportImg('');
        fetchCommunityData();
      }
    } catch (err) {
      console.error("Report failed:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setNewReportImg(base64);
      hapticSuccess();
    } catch (e) {
      alert("Failed to convert image. Please choose another file.");
    }
  };

  const handleQuickAsk = async () => {
    if (!quickInput.trim() || isQuickLoading) return;
    hapticTap();
    setIsQuickLoading(true);
    setQuickResponse('');
    try {
      const res = await fastAIResponse(quickInput, lang);
      setQuickResponse(res);
      hapticSuccess();
    } catch (e) {
      setQuickResponse("Sorry, I couldn't get a fast answer right now.");
    } finally {
      setIsQuickLoading(false);
    }
  };

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
    // Note: We no longer generate hero images via AI as per user request.
    // Static assets in heroImages initial state are used.
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
      morning: { ENG: "Good Morning", KIS: "Habari za asubuhi", GIK: "Wia mwega", DHO: "Oyawore", LUH: "Busiere", KAL: "Chamgei mising", KAM: "Wĩmũseo Nesa" },
      afternoon: { ENG: "Good Afternoon", KIS: "Habari za mchana", GIK: "Muthenya mwega", DHO: "Osaore", LUH: "Obuire bulahi", KAL: "Chamgei", KAM: "Ũseo Nesa" },
      evening: { ENG: "Good Evening", KIS: "Habari za jioni", GIK: "Hwai-ini mwega", DHO: "Odhiambo", LUH: "Mwabuka", KAL: "Chamgei", KAM: "Ũseo Mũno" }
    };
    const timeKey = isMorning ? 'morning' : (isAfternoon ? 'afternoon' : 'evening');
    return greetings[timeKey][lang] || greetings[timeKey]['ENG'];
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20">
      
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl border-2 border-white dark:border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#135bec] leading-tight break-words">
            {getGreeting()}
          </h2>
          <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-bold tracking-tight">{t.welcome}</p>
        </div>
      </section>

      <div className="relative aspect-[16/9] min-h-[230px] rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-slate-950 border-4 border-white dark:border-slate-800">
        {heroImages[activeMood] ? (
          <img src={heroImages[activeMood]} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isGeneratingHero ? 'opacity-30' : 'opacity-100'}`} alt="Generated Civic Vision" referrerPolicy="no-referrer" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black" />
        )}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
        {isGeneratingHero && (
          <div className="absolute top-4 right-10 z-20 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/20">
             <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Generating Vision...</span>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 gap-2 sm:gap-3 z-10 text-center">
          <div className="size-12 sm:size-16 drop-shadow-[0_0_25px_rgba(255,140,0,0.4)] shrink-0"><SautiLogo /></div>
          <div className="space-y-1 sm:space-y-3">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-tight">
              {activeMood === 'queue' && "The Power of Patience"}
              {activeMood === 'ink' && "The Seal of Duty"}
              {activeMood === 'papers' && "Your Choice, Your Voice"}
              {activeMood === 'winner' && "Peaceful Progress"}
            </h1>
            <p className="text-xs sm:text-base md:text-lg font-bold text-blue-200 leading-tight max-w-[95%] mx-auto drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
              {activeMood === 'queue' && "Queuing together as one Kenya, one people."}
              {activeMood === 'ink' && "Wear your mark of truth with dignity."}
              {activeMood === 'papers' && "Six choices to define our shared future."}
              {activeMood === 'winner' && "Honoring the will of the people in peace."}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4 pt-1 sm:pt-2 border-t border-white/20 w-full max-w-xs justify-center shrink-0 scale-90 sm:scale-100">
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
      
      {/* Quick Ask Section (Low Latency Flash-Lite) */}
      <section className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl border-4 border-blue-50 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[#135bec] text-3xl animate-pulse">bolt</span>
          <h3 className="text-2xl font-black tracking-tighter uppercase">Quick Civic Ask</h3>
        </div>
        <div className="flex gap-2.5 items-center w-full">
          <input 
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickAsk()}
            placeholder="Ask a quick question..."
            className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3.5 font-bold outline-none focus:border-[#135bec] transition-all dark:text-white"
          />
          <button 
            onClick={handleQuickAsk}
            disabled={isQuickLoading || !quickInput.trim()}
            className="bg-[#135bec] text-white size-14 rounded-2xl shadow-lg active:scale-90 transition-all disabled:opacity-50 shrink-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">{isQuickLoading ? 'sync' : 'send'}</span>
          </button>
        </div>
        {isQuickLoading && (
          <div className="p-8 bg-blue-50/10 dark:bg-blue-900/5 rounded-[3rem] border-2 border-blue-100/20 dark:border-blue-900/20 animate-pulse shadow-inner space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-blue-400/25 rounded-full animate-bounce shrink-0" />
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded-full" />
             </div>
             <div className="space-y-3">
               <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
               <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-[92%]"></div>
               <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-[80%]"></div>
             </div>
          </div>
        )}

        {quickResponse && !isQuickLoading && (
          <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-[3rem] border-2 border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-top-4 duration-500 shadow-inner">
             <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-[#135bec] rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-xs filled">check_circle</span>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#135bec]">Verified Civic Info</span>
             </div>
             <SeniorFriendlyText text={quickResponse} />
             <div className="mt-6 pt-4 border-t border-blue-100 flex justify-end">
                <button 
                  onClick={() => { hapticTap(); speakText(quickResponse.replace(/\*\*/g, ''), lang); }}
                  className="flex items-center gap-2 text-[#135bec] font-black text-xs uppercase hover:opacity-70"
                >
                   <span className="material-symbols-outlined text-sm">volume_up</span>
                   Listen
                </button>
             </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 px-2 justify-center">
          {ELECTION_MOODS.map(mood => (
            <button 
              key={mood.id} 
              onClick={() => handleMoodChange(mood.id)} 
              className={`flex items-center gap-3 pl-2 pr-6 py-2 rounded-full transition-all border-4 font-black uppercase text-[10px] tracking-widest cursor-pointer ${
                activeMood === mood.id 
                  ? 'bg-[#135bec] border-[#135bec] text-white shadow-xl scale-105' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
              }`}
            >
              <div className="size-10 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                <img src={heroImages[mood.id] || mood.image} className="w-full h-full object-cover" alt={mood.label} />
              </div>
              <span className={`material-symbols-outlined text-lg ${activeMood === mood.id ? 'text-white' : 'text-[#135bec] dark:text-blue-400'}`}>{mood.icon}</span>
              {mood.label}
            </button>
          ))}
      </div>

      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[4rem] border-4 border-[#135bec]/10 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span></span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">{t.latestNews}</h3>
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
      <section className="bg-slate-900 text-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl space-y-6 relative overflow-hidden border-4 border-white/10">
        <div className="absolute -right-20 -top-20 size-60 bg-[#135bec] opacity-20 blur-[80px]" />
        <div className="relative z-10 flex items-center justify-between gap-4">
           <div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">The Voter's Charter</h3>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{VOTERS_CHARTER.source}</p>
           </div>
           <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-xl filled">gavel</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{VOTERS_CHARTER.article}</span>
           </div>
        </div>

        <div className="relative z-10 bg-white/5 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10">
           <p className="text-xl sm:text-2xl font-bold italic leading-relaxed text-blue-50">
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

      {/* SautiSahihi Community Action Circle */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] border-4 border-[#135bec]/10 shadow-xl space-y-8 animate-in slide-in-from-bottom-5">
        
        <div className="flex justify-between items-center gap-4 flex-wrap pb-4 border-b border-slate-150/40">
           <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#135bec] text-4xl filled">groups</span>
              <div>
                 <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">Community Hub</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Peace Pledges & Live Observations</p>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/20 gap-1 font-sans">
              <button 
                type="button"
                onClick={() => { hapticTap(); setCommunityTab('pledges'); }}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-black rounded-xl transition-all ${communityTab === 'pledges' ? 'bg-[#135bec] text-white shadow' : 'text-slate-500'}`}
              >
                 🕊️ Pledges
              </button>
              <button 
                type="button"
                onClick={() => { hapticTap(); setCommunityTab('reports'); }}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-black rounded-xl transition-all ${communityTab === 'reports' ? 'bg-[#135bec] text-white shadow' : 'text-slate-500'}`}
              >
                 📢 Observations
              </button>
           </div>
        </div>

        {communityTab === 'pledges' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
             <p className="text-lg leading-relaxed font-bold text-slate-600 dark:text-slate-300">
                Join thousands of Kenyan citizens committing to peace, local support, and fact-checking during devolution. Submit your own vow of peace on our digital interactive wall:
             </p>

             {/* Sticky notes Wall */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                {pledges.map((pledge, pIdx) => {
                  const paperColors = [
                    'bg-amber-50/70 text-amber-950 border-amber-200 rotate-1',
                    'bg-rose-50/70 text-rose-950 border-rose-200 -rotate-1',
                    'bg-blue-50/70 text-blue-950 border-blue-200 rotate-2',
                    'bg-emerald-50/70 text-emerald-950 border-emerald-200 -rotate-2',
                    'bg-violet-50/70 text-violet-950 border-violet-200 rotate-1'
                  ];
                  const paperClass = paperColors[pIdx % paperColors.length];
                  return (
                     <div key={pledge.id} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between min-h-[140px] transform transition-transform hover:scale-102 ${paperClass}`}>
                        <p className="text-sm font-bold italic leading-snug break-words">
                           "{pledge.pledgeText}"
                        </p>
                        <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-black uppercase tracking-tight opacity-75">
                           <span>{pledge.name}</span>
                           <span className="font-mono">{pledge.county}</span>
                        </div>
                     </div>
                  );
                })}
             </div>

             {/* Pledge Forms */}
             <form onSubmit={handleSubmitPledge} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-805 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#135bec]">Pin your Pledge of Peace</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name / Alias</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. John Kamau" 
                        value={newPledgeName}
                        onChange={(e) => setNewPledgeName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold font-sans dark:text-white outline-none focus:border-[#135bec]"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Your County</label>
                      <select 
                        value={newPledgeCounty}
                        onChange={(e) => setNewPledgeCounty(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold font-sans dark:text-white outline-none"
                      >
                         {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select or Write Pledge Text</label>
                   <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        "I pledge to help seniors and vulnerable walk to stations safely.",
                        "I pledge to promote peace and support facts in my ward.",
                        "I pledge to stand for transparency and support devolution."
                      ].map((preset, prId) => (
                         <button 
                           key={prId} 
                           type="button" 
                           onClick={() => { hapticTap(); setNewPledgeText(preset); }}
                           className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${newPledgeText === preset ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                         >
                            Option {prId + 1}
                         </button>
                      ))}
                   </div>
                   <textarea 
                     required
                     value={newPledgeText}
                     onChange={(e) => setNewPledgeText(e.target.value)}
                     className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-4 rounded-xl font-bold font-sans text-base dark:text-white outline-none focus:border-[#135bec]"
                     rows={2}
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingPledge}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4.5 rounded-2xl border-b-4 border-blue-950 active:scale-95 transition-all text-sm uppercase"
                >
                   {isSubmittingPledge ? 'Submitting Commitments...' : 'Post Pin to Peace Wall'}
                </button>
             </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
             <p className="text-lg leading-relaxed font-bold text-slate-600 dark:text-slate-300">
                A crowdsourced, citizen observation platform allowing users to submit transparent reports about voter education sessions, peacemaker chief barazas, or functional KIEMS kit demonstrations around their constituency:
             </p>

             {/* Reports List */}
             <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                     {report.image && (
                        <div className="w-full sm:w-40 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-200/50 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                           <img src={report.image} className="w-full h-full object-cover" alt={report.title} referrerPolicy="no-referrer" />
                        </div>
                     )}
                     <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                           <div className="flex items-center gap-2">
                              <span className="font-black text-[10px] uppercase tracking-wider text-[#135bec] dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
                                 {report.category}
                              </span>
                              <span className="font-mono text-xs font-black text-slate-400">
                                 {report.county} County
                              </span>
                           </div>

                           {report.status === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-300/30">
                                 ✓ VERIFIED BY OBSERVATION DESK
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-amber-300/30">
                                 ⏱️ PENDING VERIFICATION Check
                              </span>
                           )}
                        </div>

                        <h4 className="text-xl font-black text-slate-950 dark:text-white leading-tight">
                           {report.title}
                        </h4>

                        <p className="text-base text-slate-505 dark:text-slate-350 font-bold leading-relaxed">
                           {report.description}
                        </p>

                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                           Reported on: {new Date(report.timestamp).toLocaleDateString()} at {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                     </div>
                  </div>
                ))}
             </div>

             {/* Submit form */}
             <form onSubmit={handleSubmitReport} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#135bec]">Submit Local Community Observation</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Observation Short Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Elderly Voters Drive Success at Ward Hall" 
                        value={newReportTitle}
                        onChange={(e) => setNewReportTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold dark:text-white outline-none focus:border-[#135bec]"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">County Area</label>
                      <select 
                        value={newReportCounty}
                        onChange={(e) => setNewReportCounty(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold dark:text-white outline-none"
                      >
                         {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category of Event</label>
                      <select 
                        value={newReportCategory}
                        onChange={(e) => setNewReportCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold dark:text-white outline-none"
                      >
                         <option value="Voter Education">Voter Education Session</option>
                         <option value="Peace & Accord">Peace & Accord chief baraza</option>
                         <option value="IEBC Live Check">KIEMS process demonstration</option>
                         <option value="Elders Support">Assisting elders support</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Observational Photo (Touch / Click)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs text-slate-405 dark:text-slate-350"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Details of Observation</label>
                   <textarea 
                     required
                     value={newReportDesc}
                     onChange={(e) => setNewReportDesc(e.target.value)}
                     placeholder="Briefly describe what was observed... (e.g. Local village mobilizers and community workers successfully explained voting booth procedures and translated the materials into localized languages for elders)."
                     className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-4 rounded-xl font-bold text-base dark:text-white outline-none focus:border-[#135bec]"
                     rows={3}
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl border-b-4 border-blue-955 active:scale-95 transition-all text-sm uppercase"
                >
                   {isSubmittingReport ? 'Submitting Report...' : 'Add Community Observation'}
                </button>
             </form>
          </div>
        )}

      </section>

      <div className="grid grid-cols-1 gap-6">
        <button onClick={() => { hapticTap(); onNavigate('fact-checker'); }} className="p-6 sm:p-10 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 active:scale-95 transition-all text-left group overflow-hidden relative">
          <div className="size-16 sm:size-24 bg-white/20 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shrink-0 border-2 border-white/20"><span className="material-symbols-outlined text-4xl sm:text-6xl filled">fact_check</span></div>
          <div className="space-y-1"><h4 className="font-black text-3xl sm:text-4xl tracking-tighter">{t.factChecker}</h4><p className="font-bold opacity-90 text-lg sm:text-xl italic leading-tight">Identify truth from rumors instantly.</p></div>
        </button>
        
        <button onClick={() => { hapticTap(); onNavigate('learn'); }} className="p-8 sm:p-12 bg-emerald-600 text-white rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl flex flex-col gap-6 active:scale-95 transition-all text-left">
          <span className="material-symbols-outlined text-5xl sm:text-7xl filled">school</span>
          <div>
            <h4 className="font-black text-3xl sm:text-4xl tracking-tighter">{t.learn}</h4>
            <p className="font-bold opacity-80 text-lg sm:text-xl">Civic Academy</p>
          </div>
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] border-4 border-[#135bec]/10 shadow-xl space-y-6">
        <div className="flex items-center gap-4"><div className="bg-[#135bec] p-3 rounded-2xl text-white shrink-0"><span className="material-symbols-outlined text-3xl filled">account_balance</span></div><div><h3 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight">IEBC Support Desk</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Access</p></div></div>
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
