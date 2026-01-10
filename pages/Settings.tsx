
import React from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { hapticTap } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  t: TranslationSet;
  onOpenKey?: () => void;
}

const Settings: React.FC<Props> = ({ lang, setLang, darkMode, setDarkMode, t, onOpenKey }) => {
  const languages: { code: AppLanguage; label: string }[] = [
    { code: 'ENG', label: 'English' },
    { code: 'KIS', label: 'Kiswahili' },
    { code: 'GIK', label: 'Gikuyu' },
    { code: 'DHO', label: 'Dholuo' },
    { code: 'LUH', label: 'Luhya' },
  ];

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
              onClick={() => { hapticTap(); setLang(l.code); }}
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

      <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-4 border-rose-100 flex items-start gap-4">
        <span className="material-symbols-outlined text-rose-500 text-3xl">info</span>
        <div>
          <h3 className="text-2xl font-black text-rose-600 tracking-tight uppercase">Master Registry Enabled</h3>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
            Version 1.4.0 (Master Blueprint Edition). Data persistence locked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
