import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, TranslationSet, GroundingLink } from '../types.ts';
import { chatAssistant, speakText } from '../geminiService.ts';
import { translateToKiswahili } from '../hfService.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';
import { CIVIC_FAQS } from '../constants.tsx';
import { useSpeechToText } from '../useSpeechToText.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  originalText?: string;
  links?: GroundingLink[];
  isTranslated?: boolean;
}

const Assistant: React.FC<Props> = ({ lang, t }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Jambo! I am your SautiSahihi Assistant. I can help you understand laws, find offices, or check current news. Just tap the microphone and ask me anything.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const currentMsg = messages[messages.length - 1];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;
    
    hapticTap();
    setInput('');
    setShowKeyboard(false);
    
    // Create history for API
    const history = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // Update UI with user's question
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    if (!isOnline) {
      setMessages(prev => [...prev, { role: 'ai', text: "You are currently offline. Please check your internet to get the latest civic updates." }]);
      setLoading(false);
      return;
    }

    try {
      const response = await chatAssistant(textToSend, lang, history);
      const aiMsg: Message = { role: 'ai', text: response.text, links: response.links };
      setMessages(prev => [...prev, aiMsg]);
      hapticSuccess();
      
      // Auto-Read for seniors
      handleRead(response.text);
    } catch (e) {
      hapticWarning();
      setMessages(prev => [...prev, { role: 'ai', text: "Pole, I am having trouble connecting. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (text: string) => {
    if (isReading) return;
    setIsReading(true);
    try {
      await speakText(text);
    } finally {
      setIsReading(false);
    }
  };

  const toggleTranslation = async () => {
    if (currentMsg.role !== 'ai' || loading) return;
    hapticTap();

    if (currentMsg.isTranslated && currentMsg.originalText) {
      const reverted = { ...currentMsg, text: currentMsg.originalText, isTranslated: false };
      setMessages(prev => [...prev.slice(0, -1), reverted]);
    } else {
      setLoading(true);
      try {
        const swahiliText = await translateToKiswahili(currentMsg.text);
        const translated = { 
          ...currentMsg, 
          originalText: currentMsg.text, 
          text: swahiliText, 
          isTranslated: true 
        };
        setMessages(prev => [...prev.slice(0, -1), translated]);
        hapticSuccess();
        handleRead(swahiliText);
      } catch (e) {
        hapticWarning();
      } finally {
        setLoading(false);
      }
    }
  };

  const { isListening, isSupported, startListening } = useSpeechToText(lang, (transcript) => {
    handleSend(transcript);
  });

  const handleFaqClick = (faq: { q: string, a: string }) => {
    hapticTap();
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: faq.q },
      { role: 'ai', text: faq.a }
    ]);
    handleRead(faq.a);
  };

  const faqs = CIVIC_FAQS[lang] || CIVIC_FAQS['ENG'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-2xl mx-auto px-2">
      
      {/* 1. Header & Identity */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 p-2 bg-blue-50 dark:bg-slate-800 rounded-full pr-6">
          <div className="size-16 bg-[#135bec] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="material-symbols-outlined text-white text-4xl filled">face</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#135bec]">{t.assistant}</h2>
            <div className="flex items-center gap-1.5">
               <div className={`size-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                 {isOnline ? 'Live Assistant' : 'Offline Mode'}
               </span>
            </div>
          </div>
        </div>
        
        {messages.length > 1 && (
          <button 
            onClick={() => setMessages([{ role: 'ai', text: 'How else can I help you today?' }])}
            className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase hover:text-rose-500 transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            New Session
          </button>
        )}
      </div>

      {/* 2. Main Focused Response Card */}
      <div className="flex-1 flex flex-col justify-center items-center py-4">
        {loading ? (
          <div className="text-center space-y-6">
            <div className="relative size-32 mx-auto">
               <div className="absolute inset-0 bg-[#135bec]/20 rounded-full animate-ping" />
               <div className="relative size-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-[#135bec] shadow-xl">
                 <span className="material-symbols-outlined text-[#135bec] text-5xl animate-bounce">psychology</span>
               </div>
            </div>
            <p className="text-2xl font-black text-[#135bec] animate-pulse uppercase tracking-widest">Thinking...</p>
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-slate-800 rounded-[3.5rem] p-10 shadow-2xl border-4 border-blue-50 dark:border-slate-700 animate-in zoom-in-95 duration-500 relative">
            {/* User context indicator */}
            {messages.length > 1 && messages[messages.length-2].role === 'user' && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-l-4 border-blue-300">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Your Question</p>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300 italic">"{messages[messages.length-2].text}"</p>
              </div>
            )}

            {/* AI Answer */}
            <div className="space-y-6">
               <p className="text-3xl sm:text-4xl font-black leading-tight text-slate-900 dark:text-white">
                 {currentMsg.text}
               </p>

               {currentMsg.links && currentMsg.links.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {currentMsg.links.map((link, idx) => (
                    <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full text-xs font-black text-blue-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">verified</span> {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar for Seniors */}
            <div className="flex items-center justify-center gap-6 mt-10">
               <button 
                  onClick={() => handleRead(currentMsg.text)}
                  className={`size-20 rounded-3xl flex items-center justify-center transition-all ${isReading ? 'bg-emerald-500 text-white animate-pulse shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)]' : 'bg-slate-100 dark:bg-slate-900 text-[#135bec] border-2 border-transparent'}`}
               >
                 <span className="material-symbols-outlined text-4xl">{isReading ? 'graphic_eq' : 'volume_up'}</span>
               </button>

               <button 
                  onClick={toggleTranslation}
                  className={`px-8 py-5 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-lg flex items-center gap-3 active:scale-95 transition-all ${
                    currentMsg.isTranslated ? 'bg-emerald-100 text-emerald-700' : 'bg-[#135bec] text-white'
                  }`}
               >
                 <span className="material-symbols-outlined">translate</span>
                 {currentMsg.isTranslated ? 'Show Original' : 'Translate'}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Interaction Zone */}
      <div className="space-y-4 pb-4">
        {!showKeyboard && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={startListening} 
              className={`size-32 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-b-8 ${
                isListening ? 'bg-rose-600 border-rose-900 text-white animate-pulse' : 'bg-[#135bec] border-blue-900 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-6xl">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
              {isListening ? 'I am listening...' : 'Tap to speak'}
            </p>
            
            <button 
              onClick={() => { hapticTap(); setShowKeyboard(true); }}
              className="text-sm font-black text-[#135bec] underline underline-offset-8 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">keyboard</span>
              Type instead
            </button>
          </div>
        )}

        {showKeyboard && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-blue-50 flex items-center gap-2 animate-in slide-in-from-bottom-5">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent border-none outline-none p-4 text-2xl font-black dark:text-white"
            />
            <button 
              onClick={() => handleSend()}
              className="size-16 bg-[#135bec] text-white rounded-full flex items-center justify-center shadow-xl"
            >
              <span className="material-symbols-outlined text-3xl">send</span>
            </button>
            <button 
              onClick={() => setShowKeyboard(false)}
              className="size-16 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">cancel</span>
            </button>
          </div>
        )}

        {/* Big FAQ buttons for easy tapping */}
        {!loading && messages.length === 1 && (
          <div className="grid grid-cols-1 gap-3 pt-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-2">Try asking these:</p>
            {faqs.map((faq, idx) => (
              <button 
                key={idx} 
                onClick={() => handleFaqClick(faq)} 
                className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 rounded-[2rem] text-left shadow-sm flex items-center justify-between group active:bg-blue-50"
              >
                <span className="text-xl font-black text-slate-700 dark:text-white">{faq.q}</span>
                <span className="material-symbols-outlined text-[#135bec] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assistant;
