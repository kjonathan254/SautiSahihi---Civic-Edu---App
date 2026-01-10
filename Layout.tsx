
import React from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeScreen, 
  onNavigate, 
  title, 
  showBack, 
  onBack,
  headerRight 
}) => {
  return (
    <div className="relative flex h-full min-h-screen w-full max-w-md mx-auto flex-col bg-background dark:bg-slate-900 shadow-2xl overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-4 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-700">
        {showBack ? (
          <button 
            onClick={onBack}
            className="flex size-12 shrink-0 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-700"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontSize: '28px' }}>arrow_back</span>
          </button>
        ) : (
          <div className="size-12" /> 
        )}
        
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center truncate px-2">
          {title || "SautiSahihi"}
        </h1>

        {headerRight ? headerRight : <div className="size-12" />}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe pt-2 px-2 z-50">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto">
          <button 
            onClick={() => onNavigate(AppScreen.DASHBOARD)}
            className={`flex-1 flex flex-col items-center gap-1 ${activeScreen === AppScreen.DASHBOARD ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeScreen === AppScreen.DASHBOARD ? 'filled' : ''}`}>home</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => onNavigate(AppScreen.VERIFY_INPUT)}
            className={`flex-1 flex flex-col items-center gap-1 ${activeScreen === AppScreen.VERIFY_INPUT ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeScreen === AppScreen.VERIFY_INPUT ? 'filled' : ''}`}>verified_user</span>
            <span className="text-[10px] font-bold">Verify</span>
          </button>
          <button 
            onClick={() => onNavigate(AppScreen.RESULTS)}
            className={`flex-1 flex flex-col items-center gap-1 ${activeScreen === AppScreen.RESULTS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeScreen === AppScreen.RESULTS ? 'filled' : ''}`}>monitoring</span>
            <span className="text-[10px] font-bold">Results</span>
          </button>
          <button 
            onClick={() => onNavigate(AppScreen.LEARN)}
            className={`flex-1 flex flex-col items-center gap-1 ${activeScreen === AppScreen.LEARN ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeScreen === AppScreen.LEARN ? 'filled' : ''}`}>school</span>
            <span className="text-[10px] font-bold">Learn</span>
          </button>
          <button 
            onClick={() => onNavigate(AppScreen.PROFILE)}
            className={`flex-1 flex flex-col items-center gap-1 ${activeScreen === AppScreen.PROFILE ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeScreen === AppScreen.PROFILE ? 'filled' : ''}`}>person</span>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
