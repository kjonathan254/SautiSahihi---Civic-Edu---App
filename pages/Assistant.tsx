import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, TranslationSet, GroundingLink } from '../types.ts';
import { chatAssistant, speakText } from '../geminiService.ts';
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
  links?: GroundingLink[];
}

/**
 * SeniorFriendlyText - Parses markdown-like strings into clean, senior-friendly layouts.
 */
export const SeniorFriendlyText: React.FC<{ text: string }> = ({ text }) => {
  const processEmphasis = (line: string) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="font-black underline decoration-[#135bec] decoration-4 underline-offset-4">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="space-y-4 my-6 list-none">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Specialized styling for Source/Section citations
    const isCitationHeader = /^(Source|Section|Article|Ibara|Sehemu|Vyanzo):/i.test(trimmed);
    const isCitationContent = /^(Constitution|Elections Act|IEBC Act|Political Parties|Sheria)/i.test(trimmed) || (trimmed.startsWith('Article') || trimmed.startsWith('Section'));

    if (isCitationHeader) {
      flushList();
      blocks.push(
        <p key={idx} className="text-sm font-black text-[#135bec] uppercase tracking-[0.2em] mt-8 mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">history_edu</span> {trimmed}
        </p>
      );
    } else if (isCitationContent && blocks.length > 0) {
      flushList();
      blocks.push(
        <p key={idx} className="text-xl font-bold text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 border-l-4 border-blue-200 rounded-r-xl">
          {trimmed}
        </p>
      );
    } else {
      const listMatch = trimmed.match(/^(\*|-|\d+\.)\s+(.*)/);
      if (listMatch) {
        currentList.push(
          <li key={idx} className="flex gap-4 items-start bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[2rem] border-2 border-blue-100/50">
            <div className="size-8 bg-[#135bec] rounded-full flex items-center justify-center shrink-0 mt-1 shadow-lg">
               <div className="size-3 bg-white rounded-full" />
            </div>
            <span className="text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100">
              {processEmphasis(listMatch[2])}
            </span>
          </li>
        );
      } else {
        flushList();
        blocks.push(
          <p key={idx} className="text-3xl font-black leading-tight text-slate-900 dark:text-white mb-6 last:mb-0">
            {processEmphasis(trimmed)}
          </p>
        );
      }
    }
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
};

const Assistant: React.FC<Props> = ({ lang, t }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Jambo! I am your SautiSahihi Assistant.\n\n* I can help you understand laws.\n* I can help you find offices.\n* I can check the latest news.\n\nJust **tap the microphone** and ask me anything.` }
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
    
    const history = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

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
      handleRead(response.text);

      // Track assistant query
      try {
        await fetch('/api/track/assistant', { method: 'POST' });
      } catch (trackErr) {
        console.warn("Assistant tracking failed", trackErr);
      }
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
      const cleanText = text.replace(/\*\*/g, '');
      await speakText(cleanText);
    } finally {
      setIsReading(false);
    }
  };

  const { isListening, isSupported, startListening } = useSpeechToText(lang, (transcript) => {
    setInput(prev => prev ? prev + ' ' + transcript : transcript);
    setShowKeyboard(true);
  });

  const [faqs, setFaqs] = useState<{ id: number, question: string, answer: string, visits: number }[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        setFaqs(data);
      } catch (e) {
        console.warn("Failed to fetch FAQs", e);
      }
    };
    fetchFaqs();
  }, []);

  const handleFaqClick = async (faq: { id: number, question: string, answer: string }) => {
    hapticTap();
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: faq.question },
      { role: 'ai', text: faq.answer }
    ]);
    handleRead(faq.answer);

    // Track visit
    try {
      await fetch(`/api/faqs/${faq.id}/visit`, { method: 'POST' });
    } catch (e) {
      console.warn("FAQ analytics failed", e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-2xl mx-auto px-2">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6 p-3 bg-blue-50 dark:bg-slate-800 rounded-[2.5rem] pr-8">
          <div className="size-20 bg-[#135bec] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="material-symbols-outlined text-white text-5xl filled">face</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#135bec]">{t.assistant}</h2>
            <div className="flex items-center gap-2">
               <div className={`size-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               <span className="text-xs font-black uppercase tracking-widest text-slate-500">
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
          <div className="w-full bg-white dark:bg-slate-800 rounded-[3.5rem] p-8 sm:p-12 shadow-2xl border-4 border-blue-50 dark:border-slate-700 animate-in zoom-in-95 duration-500 relative overflow-hidden">
            {messages.length > 1 && messages[messages.length-2].role === 'user' && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-l-8 border-blue-300">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Question</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 italic leading-tight">"{messages[messages.length-2].text}"</p>
              </div>
            )}

            <div className="space-y-2">
               <SeniorFriendlyText text={currentMsg.text} />

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

            <div className="flex items-center justify-center gap-6 mt-10 pt-6 border-t border-slate-50">
               <button 
                  onClick={() => handleRead(currentMsg.text)}
                  className={`size-20 rounded-3xl flex items-center justify-center transition-all ${isReading ? 'bg-emerald-500 text-white animate-pulse shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)]' : 'bg-slate-100 dark:bg-slate-900 text-[#135bec] border-2 border-transparent'}`}
               >
                 <span className="material-symbols-outlined text-4xl">{isReading ? 'graphic_eq' : 'volume_up'}</span>
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pb-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-blue-50 flex items-center gap-2 mb-6">
          {isSupported && (
            <button 
              onClick={startListening}
              className={`size-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              <span className="material-symbols-outlined text-3xl">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>
          )}
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your question here..."
            className="flex-1 bg-transparent border-none outline-none p-4 text-2xl font-black dark:text-white"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="size-16 bg-[#135bec] text-white rounded-full flex items-center justify-center shadow-xl disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-3xl">send</span>
          </button>
        </div>

        {!loading && messages.length === 1 && (
          <div className="grid grid-cols-1 gap-3 pt-4 overflow-y-auto max-h-60 scrollbar-hide">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-2">Popular Questions:</p>
            {faqs.map((faq, idx) => (
              <button 
                key={idx} 
                onClick={() => handleFaqClick(faq)} 
                className="w-full p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 rounded-[2rem] text-left shadow-sm flex items-center justify-between group active:bg-blue-50 transition-all hover:border-blue-200"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-black text-xs">{idx + 1}</span>
                  </div>
                  <span className="text-xl font-black text-slate-700 dark:text-white">{faq.question}</span>
                </div>
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