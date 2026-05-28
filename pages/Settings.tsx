
import React, { useState } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { hapticTap, hapticSuccess } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  largeText: boolean;
  setLargeText: (l: boolean) => void;
  highContrast: boolean;
  setHighContrast: (h: boolean) => void;
  t: TranslationSet;
  onOpenKey?: () => void;
  onNavigate?: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (a: boolean) => void;
}

const Settings: React.FC<Props> = ({ lang, setLang, darkMode, setDarkMode, largeText, setLargeText, highContrast, setHighContrast, t, onOpenKey, onNavigate, isAdmin, setIsAdmin }) => {
  const [tapCount, setTapCount] = useState(0);

  const handleVersionTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 7) {
      hapticSuccess();
      setIsAdmin(!isAdmin);
      setTapCount(0);
      alert(isAdmin ? "Admin Mode Disabled" : "Admin Mode Enabled! You can now see the Analytics button.");
    } else {
      hapticTap();
    }
  };

  const languages: { code: AppLanguage; label: string }[] = [
    { code: 'ENG', label: 'English' },
    { code: 'KIS', label: 'Kiswahili' },
    { code: 'GIK', label: 'Gikuyu' },
    { code: 'DHO', label: 'Dholuo' },
    { code: 'LUH', label: 'Luhya' },
    { code: 'KAL', label: 'Kalenjin' },
    { code: 'KAM', label: 'Kamba' },
  ];

  const handleLanguageChange = async (code: AppLanguage) => {
    hapticTap();
    setLang(code);
    try {
      await fetch('/api/track/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: code })
      });
    } catch (e) {
      console.warn("Language tracking failed", e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-800 dark:bg-[#135bec] p-8 rounded-[2.5rem] text-white shadow-xl">
        <h2 className="text-3xl font-black tracking-tight mb-2">{t.settings}</h2>
        <p className="opacity-90 font-bold italic">Make SautiSahihi work best for you.</p>
      </div>

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-white dark:border-gray-800 space-y-4">
        <h3 className="text-2xl font-black">Connection Health</h3>
        <p className="text-sm font-bold opacity-60">If you see "Permission Denied" errors, try refreshing your connection with a paid API key.</p>
        <button 
          onClick={onOpenKey}
          className="w-full py-5 bg-[#135bec] text-white rounded-[2rem] font-black text-xl shadow-lg active:scale-95 transition-transform"
        >
          Refresh API Connection
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-black uppercase px-2">{t.languageSelect}</h3>
        <div className="grid grid-cols-1 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`p-6 rounded-[2rem] text-left font-black text-2xl border-4 transition-all flex justify-between items-center ${
                lang === l.code ? 'border-[#135bec] bg-blue-50 dark:bg-blue-900/30 text-[#135bec]' : 'border-white dark:border-gray-800 bg-white dark:bg-gray-800'
              }`}
            >
              {l.label}
              {lang === l.code && <span className="material-symbols-outlined text-[#135bec] filled">check_circle</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-4 border-white dark:border-gray-800">
        <h3 className="text-2xl font-black">Dark Mode</h3>
        <button
          onClick={() => { hapticTap(); setDarkMode(!darkMode); }}
          className={`w-20 h-10 rounded-full transition-all relative ${darkMode ? 'bg-[#135bec]' : 'bg-gray-200'}`}
        >
          <div className={`size-8 bg-white rounded-full absolute top-1 transition-all ${darkMode ? 'left-11' : 'left-1'}`} />
        </button>
      </section>

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-4 border-white dark:border-gray-800">
        <div>
          <h3 className="text-2xl font-black">Large Text</h3>
          <p className="text-sm font-bold opacity-60 italic">Easier to read for seniors.</p>
        </div>
        <button
          onClick={() => { hapticTap(); setLargeText(!largeText); }}
          className={`w-20 h-10 rounded-full transition-all relative ${largeText ? 'bg-[#135bec]' : 'bg-gray-200'}`}
        >
          <div className={`size-8 bg-white rounded-full absolute top-1 transition-all ${largeText ? 'left-11' : 'left-1'}`} />
        </button>
      </section>

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-4 border-white dark:border-gray-800">
        <div>
          <h3 className="text-2xl font-black">High Contrast</h3>
          <p className="text-sm font-bold opacity-60 italic">Maximum visibility.</p>
        </div>
        <button
          onClick={() => { hapticTap(); setHighContrast(!highContrast); }}
          className={`w-20 h-10 rounded-full transition-all relative ${highContrast ? 'bg-[#135bec]' : 'bg-gray-200'}`}
        >
          <div className={`size-8 bg-white rounded-full absolute top-1 transition-all ${highContrast ? 'left-11' : 'left-1'}`} />
        </button>
      </section>

      <div 
        onClick={handleVersionTap}
        className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-4 border-rose-100 flex items-start gap-4 select-none active:bg-rose-100 transition-colors"
      >
        <span className="material-symbols-outlined text-rose-500 text-3xl">info</span>
        <div>
          <h3 className="text-2xl font-black text-rose-600 tracking-tight uppercase">Master Registry Enabled</h3>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
            Version 1.4.0 (Master Blueprint Edition). Data persistence locked.
          </p>
        </div>
      </div>

      {isAdmin && (
        <button 
          onClick={() => onNavigate?.('analytics')}
          className="w-full py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-dashed border-slate-200"
        >
          <span className="material-symbols-outlined">monitoring</span>
          View Backend Analytics
        </button>
      )}
    </div>
  );
};

export default Settings;
