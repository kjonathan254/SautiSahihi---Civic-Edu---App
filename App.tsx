import { TranslationSet, AppLanguage } from './types.ts';
import { TRANSLATIONS } from './constants.tsx';
import { hapticTap } from './utils.ts';
import { getAudioCtx } from './geminiService.ts';
import React, { useState, useEffect } from 'react';

// Pages
import Home from './pages/Home.tsx';
import FactChecker from './pages/FactChecker.tsx';
import Poll from './pages/Poll.tsx';
import Learn from './pages/Learn.tsx';
import Assistant from './pages/Assistant.tsx';
import Settings from './pages/Settings.tsx';
import OfficeLocator from './pages/OfficeLocator.tsx';

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
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1547921608-8e6ca6f076f8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1531058284747-5804182d4399?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1509059852496-f3822ae057bf?auto=format&fit=crop&q=80&w=1200"
];

const App: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>(() => (localStorage.getItem('lang') as AppLanguage) || 'ENG');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [activeTab, setActiveTab] = useState('home');
  const [hasKey, setHasKey] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [lang, darkMode]);

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
      // In production (Vercel), we expect process.env.API_KEY to be set
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setHasKey(true);
        return;
      }
      
      // AI Studio specific environment check
      if (window.aistudio?.hasSelectedApiKey) {
        const exists = await window.aistudio.hasSelectedApiKey();
        setHasKey(!!exists);
      } else {
        // If we are NOT in AI Studio and NO env var is found, we stay in "Connect" mode
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    hapticTap();
    // Initialize AudioContext on first button click to satisfy browser policies
    getAudioCtx();
    
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } else {
      alert("Please ensure your Gemini API Key is set in your environment variables (Vercel Dashboard).");
    }
  };

  const navigateTo = (tab: string) => {
    hapticTap();
    getAudioCtx(); // Ensure context is resumed
    setActiveTab(tab);
  };

  const t = TRANSLATIONS[lang];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home lang={lang} t={t} onNavigate={navigateTo} />;
      case 'fact-checker': return <FactChecker lang={lang} t={t} />;
      case 'poll': return <Poll lang={lang} t={t} />;
      case 'learn': return <Learn lang={lang} t={t} />;
      case 'assistant': return <Assistant lang={lang} t={t} />;
      case 'office-locator': return <OfficeLocator lang={lang} t={t} />;
      case 'settings': return <Settings lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} t={t} onOpenKey={handleOpenKey} />;
      default: return <Home lang={lang} t={t} onNavigate={navigateTo} />;
    }
  };

  if (!hasKey) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden bg-black font-sans">
        {KENYAN_CONTEXT_IMAGES.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-all duration-[3000ms] ${currentSlide === idx ? 'opacity-60' : 'opacity-0'}`} style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        <div className="relative z-10 w-full max-w-sm px-6 text-center space-y-8 animate-in fade-in duration-700">
          <div className="p-10 bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl border border-white/10 space-y-8">
            <div className="size-36 mx-auto"><SautiLogo /></div>
            <h1 className="text-5xl font-black text-white">SautiSahihi</h1>
            <p className="text-lg text-white font-bold italic leading-tight">Clarity • Dignity • Truth</p>
            <button onClick={handleOpenKey} className="w-full bg-[#135bec] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-xl border-b-8 border-blue-900">
              {t.connectBtn || "CONNECT"}
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Requires Gemini API Access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`p-4 shadow-xl sticky top-0 z-50 ${darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-100'}`}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3" onClick={() => navigateTo('home')}>
            <div className="size-11"><SautiLogo /></div>
            <h1 className="text-2xl font-black text-[#135bec]">SautiSahihi</h1>
          </div>
          <button onClick={() => navigateTo('settings')} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800">
            <span className="material-symbols-outlined text-3xl">settings</span>
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-40"><div className="max-w-3xl mx-auto p-4">{renderContent()}</div></main>
      <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 z-50 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-3xl mx-auto flex justify-around items-center h-20">
          <NavItem active={activeTab === 'home'} icon="home" label={t.home} onClick={() => navigateTo('home')} />
          <NavItem active={activeTab === 'fact-checker'} icon="fact_check" label={t.factChecker} onClick={() => navigateTo('fact-checker')} />
          <NavItem active={activeTab === 'office-locator'} icon="location_on" label={t.iebcLocator} onClick={() => navigateTo('office-locator')} />
          <NavItem active={activeTab === 'learn'} icon="school" label={t.learn} onClick={() => navigateTo('learn')} />
          <NavItem active={activeTab === 'assistant'} icon="voice_chat" label={t.assistant} onClick={() => navigateTo('assistant')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl ${active ? 'bg-[#135bec]/10 text-[#135bec]' : 'text-gray-400'}`}>
    <span className={`material-symbols-outlined text-4xl mb-0.5 ${active ? 'filled scale-110' : ''}`}>{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
  </button>
);

export default App;