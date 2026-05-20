import { TranslationSet, AppLanguage } from './types.ts';
import { TRANSLATIONS } from './constants.tsx';
import { hapticTap } from './utils.ts';
import { getAudioCtx } from './geminiService.ts';
import React, { useState, useEffect } from 'react';

// Pages
import Home from './pages/Home.tsx';
import FactChecker from './pages/FactChecker.tsx';
import Learn from './pages/Learn.tsx';
import Assistant from './pages/Assistant.tsx';
import Settings from './pages/Settings.tsx';
import OfficeLocator from './pages/OfficeLocator.tsx';
import Analytics from './pages/Analytics.tsx';

const SautiLogo: React.FC<{ size?: string; className?: string }> = ({ size = "100%", className = "" }) => (
  <svg viewBox="0 0 400 400" className={className} style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#FF0000', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#006400', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M200 50 C290 50 360 110 360 185 C360 260 290 320 200 320 L160 360 L165 320 C90 315 40 260 40 185 C40 110 110 50 200 50 Z" fill="url(#logoGrad)" />
    <g transform="translate(160, 120) scale(1.1)">
      <rect x="24" y="0" width="32" height="60" rx="16" fill="white" />
      <path d="M12 25 Q12 65 40 65 Q68 65 68 25" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <rect x="36" y="65" width="8" height="20" fill="white" />
      <rect x="20" y="85" width="40" height="6" rx="3" fill="white" />
    </g>
  </svg>
);

const KENYAN_CONTEXT_IMAGES = [
  "/images/voter-queue.webp",
  "/images/seal-of-duty.webp",
  "/images/your-choice-your-voice.webp",
  "/images/peaceful-progress.webp",
  "/images/voter-registration.webp",
  "/images/senior-rights.webp"
];

const App: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>(() => {
    try {
      return (localStorage.getItem('lang') as AppLanguage) || 'ENG';
    } catch {
      return 'ENG';
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [hasKey, setHasKey] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });
  const [largeText, setLargeText] = useState(() => {
    try {
      return localStorage.getItem('largeText') === 'true';
    } catch {
      return false;
    }
  });
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem('highContrast') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
      localStorage.setItem('darkMode', darkMode.toString());
      localStorage.setItem('isAdmin', isAdmin.toString());
      localStorage.setItem('largeText', largeText.toString());
      localStorage.setItem('highContrast', highContrast.toString());
    } catch (e) {
      console.warn("localStorage.setItem failed in App.tsx:", e);
    }

    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    if (largeText) document.documentElement.classList.add('large-text');
    else document.documentElement.classList.remove('large-text');

    if (highContrast) document.documentElement.classList.add('high-contrast');
    else document.documentElement.classList.remove('high-contrast');
  }, [lang, darkMode, isAdmin, largeText, highContrast]);

  useEffect(() => {
    if (!hasKey) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % KENYAN_CONTEXT_IMAGES.length);
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [hasKey]);

  useEffect(() => {
    const checkKey = async () => {
      // Prioritize Vercel Dashboard API_KEY
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setHasKey(true);
        return;
      }
      
      if (window.aistudio?.hasSelectedApiKey) {
        const exists = await window.aistudio.hasSelectedApiKey();
        setHasKey(!!exists);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    hapticTap();
    // CRITICAL: Warm up AudioContext on user gesture to allow voice output later
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } else if (process.env.API_KEY) {
      setHasKey(true);
    } else {
      alert("No API key detected. Please add your GEMINI API KEY to your environment variables.");
    }
  };

  const navigateTo = (tab: string) => {
    hapticTap();
    // Keep AudioContext active
    getAudioCtx().resume();
    setActiveTab(tab);
  };

  const t = TRANSLATIONS[lang];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <h1 className="text-2xl font-black text-[#135bec] truncate">SautiSahihi</h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 gap-1 animate-pulse shadow-sm border border-emerald-200/20 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              LIVE
            </span>
          </div>
        );
      case 'fact-checker':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-emerald-600 filled font-normal text-3xl shrink-0">verified</span>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{t.factChecker}</span>
          </div>
        );
      case 'office-locator':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-red-500 filled font-normal text-3xl shrink-0">location_on</span>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{t.iebcLocator}</span>
          </div>
        );
      case 'learn':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-amber-500 filled font-normal text-3xl shrink-0">school</span>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{t.learn}</span>
          </div>
        );
      case 'assistant':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-[#135bec] filled font-normal text-3xl shrink-0">psychology</span>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{t.assistant}</span>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-slate-500 filled font-normal text-3xl shrink-0">settings</span>
            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{t.settings}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <h1 className="text-2xl font-black text-[#135bec] truncate">SautiSahihi</h1>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home lang={lang} t={t} onNavigate={navigateTo} />;
      case 'fact-checker': return <FactChecker lang={lang} t={t} />;
      case 'learn': return <Learn lang={lang} t={t} />;
      case 'assistant': return <Assistant lang={lang} t={t} />;
      case 'office-locator': return <OfficeLocator lang={lang} t={t} />;
      case 'analytics': return <Analytics lang={lang} t={t} />;
      case 'settings': return <Settings lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} largeText={largeText} setLargeText={setLargeText} highContrast={highContrast} setHighContrast={setHighContrast} t={t} onOpenKey={handleOpenKey} onNavigate={navigateTo} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />;
      default: return <Home lang={lang} t={t} onNavigate={navigateTo} />;
    }
  };

  if (!hasKey) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden bg-black font-sans">
        {KENYAN_CONTEXT_IMAGES.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms] ${currentSlide === idx ? 'opacity-60' : 'opacity-0'}`} 
            referrerPolicy="no-referrer" 
            alt="Kenya Context"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        <div className="relative z-10 w-full max-w-sm px-6 text-center space-y-8 animate-in fade-in duration-700">
          <div className="p-10 bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/10 space-y-8">
            <div className="size-36 mx-auto"><SautiLogo /></div>
            <h1 className="text-5xl font-black text-white">SautiSahihi</h1>
            <p className="text-lg text-white font-bold italic leading-tight">Clarity • Dignity • Truth</p>
            <button onClick={handleOpenKey} className="w-full bg-[#135bec] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-xl border-b-8 border-blue-900 active:scale-95 transition-all">
              {t.connectBtn || "ENTER APP"}
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black italic">Respectful Civic Platform</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`p-4 shadow-xl shrink-0 sticky top-0 z-50 ${darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-100'}`}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 mr-2" onClick={() => navigateTo('home')}>
            <div className="size-11"><SautiLogo /></div>
            {getHeaderTitle()}
          </div>
          <button onClick={() => navigateTo('settings')} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-3xl">settings</span>
          </button>
        </div>
      </header>
      
      <main className={`flex-1 ${activeTab === 'assistant' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        <div className={`w-full mx-auto ${activeTab === 'assistant' ? 'flex flex-col flex-1 h-full max-w-3xl' : 'max-w-3xl p-4 pb-12'}`}>
          {renderContent()}
        </div>
      </main>

      <nav className={`border-t p-2 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-3xl mx-auto flex justify-around items-center h-24">
          <NavItem active={activeTab === 'home'} icon="home" label={t.home} onClick={() => navigateTo('home')} highContrast={highContrast} />
          <NavItem active={activeTab === 'fact-checker'} icon="fact_check" label={t.factChecker} onClick={() => navigateTo('fact-checker')} highContrast={highContrast} />
          <NavItem active={activeTab === 'office-locator'} icon="location_on" label={t.iebcLocator} onClick={() => navigateTo('office-locator')} highContrast={highContrast} />
          <NavItem active={activeTab === 'learn'} icon="school" label={t.learn} onClick={() => navigateTo('learn')} highContrast={highContrast} />
          <NavItem active={activeTab === 'assistant'} icon="voice_chat" label={t.assistant} onClick={() => navigateTo('assistant')} highContrast={highContrast} />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void; highContrast?: boolean }> = ({ active, icon, label, onClick, highContrast }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${active ? (highContrast ? 'bg-black text-white border-2 border-white' : 'bg-[#135bec] text-white shadow-lg scale-105') : (highContrast ? 'text-white font-bold' : 'text-gray-500')}`}>
    <span className={`material-symbols-outlined text-5xl mb-1 ${active ? 'filled' : ''}`}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
  </button>
);

export default App;