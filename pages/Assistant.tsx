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
 * Highlights key words instead of underlining them to avoid mimicking active links.
 */
export const SeniorFriendlyText: React.FC<{ text: string }> = ({ text }) => {
  const processEmphasis = (line: string) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <mark 
            key={i} 
            className="bg-amber-100 dark:bg-amber-950/60 text-slate-900 dark:text-amber-100 font-extrabold px-2 py-0.5 rounded-xl border-b-2 border-amber-300 dark:border-amber-700/80 inline-block font-sans"
          >
            {part}
          </mark>
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
        <ul key={`list-${blocks.length}`} className="space-y-3 my-4 list-none">
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
        <p key={idx} className="text-xs font-black text-[#135bec] dark:text-blue-400 uppercase tracking-[0.2em] mt-6 mb-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-xs">history_edu</span> {trimmed}
        </p>
      );
    } else if (isCitationContent && blocks.length > 0) {
      flushList();
      blocks.push(
        <p key={idx} className="text-lg font-bold text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-4 border-l-4 border-blue-200 dark:border-blue-900 rounded-r-xl">
          {trimmed}
        </p>
      );
    } else {
      const listMatch = trimmed.match(/^(\*|-|\d+\.)\s+(.*)/);
      if (listMatch) {
        currentList.push(
          <li key={idx} className="flex gap-3 items-start bg-blue-50/40 dark:bg-blue-900/10 p-4 rounded-[1.75rem] border border-blue-100/50 dark:border-blue-900/20 shadow-sm">
            <div className="size-6 bg-[#135bec] rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
               <div className="size-2 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold leading-tight text-slate-800 dark:text-slate-100 font-sans">
              {processEmphasis(listMatch[2])}
            </span>
          </li>
        );
      } else {
        flushList();
        blocks.push(
          <p key={idx} className="text-2xl font-black leading-tight text-slate-900 dark:text-white mb-3 last:mb-0 font-sans">
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
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const chatScrollRef = useRef<HTMLDivElement>(null);

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

  // Smooth scroll to bottom when messages list or loading state updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

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
      setMessages(prev => [...prev, { role: 'ai', text: "You are currently offline. Please check your internet component to fetch latest civic details." }]);
      setLoading(false);
      return;
    }

    try {
      const response = await chatAssistant(textToSend, lang, history);
      const aiMsg: Message = { role: 'ai', text: response.text, links: response.links };
      setMessages(prev => [...prev, aiMsg]);
      hapticSuccess();
      
      // Auto-speak the AI response for maximum accessibility
      handleSpeak(response.text, messages.length + 1);

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

  const handleSpeak = async (text: string, idx: number) => {
    hapticTap();
    if (currentlySpeakingIdx === idx) {
      setCurrentlySpeakingIdx(null);
      await speakText(""); // Triggers speech cutoff/stop
      return;
    }
    setCurrentlySpeakingIdx(idx);
    try {
      const cleanText = text.replace(/\*\*/g, '');
      await speakText(cleanText);
    } finally {
      // Small timeout or safe status clean
      setCurrentlySpeakingIdx(null);
    }
  };

  const { isListening, isSupported, startListening } = useSpeechToText(lang, (transcript) => {
    setInput(prev => prev ? prev + ' ' + transcript : transcript);
    setShowKeyboard(true);
  });

  const getFallbackFaqs = () => {
    const baseFaqs = CIVIC_FAQS[lang] || CIVIC_FAQS["ENG"];
    const mapped = baseFaqs.map((f, i) => ({
      id: 100 + i,
      question: f.q,
      answer: f.a,
      visits: 120 - i * 15
    }));

    const generalQuestions = [
      {
        question: "How do I register to vote?",
        answer: "Visit any IEBC constituency office with your original National ID or valid Passport. Registration is continuous.",
        visits: 120
      },
      {
        question: "What is the KIEMS kit?",
        answer: "The Kenya Integrated Election Management System (KIEMS) is a biometric device used to identify voters and transmit results securely.",
        visits: 85
      },
      {
        question: "What documents do I need to vote?",
        answer: "On election day, you must carry the same original National ID or Passport you used during registration.",
        visits: 50
      },
      {
        question: "How do I verify my registration status?",
        answer: "You can check your registration status by sending your ID/Passport number via SMS to the official IEBC code (e.g. 70000) or visiting their website.",
        visits: 40
      },
      {
        question: "What rights do I have at the station?",
        answer: "As a voter, you have the right to a secret ballot. Seniors and people with disabilities have the right to go to the front of the line.",
        visits: 30
      }
    ];

    generalQuestions.forEach((q, i) => {
      if (!mapped.some(f => f.question.toLowerCase() === q.question.toLowerCase())) {
        mapped.push({
          id: i + 1,
          question: q.question,
          answer: q.answer,
          visits: q.visits
        });
      }
    });

    return mapped.sort((a, b) => b.visits - a.visits);
  };

  const [faqs, setFaqs] = useState<{ id: number, question: string, answer: string, visits: number }[]>(getFallbackFaqs());

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faqs');
        if (!res.ok) throw new Error("Status " + res.status);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(getFallbackFaqs());
        }
      } catch (e) {
        console.warn("Failed to fetch FAQs, using offline defaults:", e);
        setFaqs(getFallbackFaqs());
      }
    };
    fetchFaqs();
  }, [lang]);

  const handleFaqClick = async (faq: { id: number, question: string, answer: string }) => {
    hapticTap();
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: faq.question },
      { role: 'ai', text: faq.answer }
    ]);
    
    // Speak response automatically
    handleSpeak(faq.answer, messages.length + 1);

    // Track visit
    try {
      await fetch(`/api/faqs/${faq.id}/visit`, { method: 'POST' });
    } catch (e) {
      console.warn("FAQ analytics failed", e);
    }
  };

  const resetSession = () => {
    hapticTap();
    setMessages([
      { role: 'ai', text: `Jambo! I am your SautiSahihi Assistant.\n\n* I can help you understand laws.\n* I can help you find offices.\n* I can check the latest news.\n\nJust **tap the microphone** and ask me anything.` }
    ]);
    setCurrentlySpeakingIdx(null);
  };

  return (
    <div className="flex flex-col h-full max-h-full animate-in fade-in duration-500 w-full overflow-hidden px-4 py-2">
      
      {/* Top Professional Header Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-[#135bec] dark:bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md">
            <span className="material-symbols-outlined text-white text-3xl filled leading-none">face</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{t.assistant}</h2>
            <div className="flex items-center gap-1.5 lines-none">
              <div className={`size-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isOnline ? 'Active' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>
        
        {messages.length > 1 && (
          <button 
            onClick={resetSession}
            id="new-session-btn"
            className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3.5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            New Session
          </button>
        )}
      </div>

      {/* Modern Conversational Chat History Area */}
      <div 
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto space-y-6 py-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 flex flex-col justify-start"
      >
        {messages.map((msg, idx) => {
          const isAi = msg.role === 'ai';
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start mr-auto items-end' : 'self-end ml-auto flex-row-reverse items-end'}`}
            >
              {isAi && (
                <div className="size-10 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-blue-100 dark:border-slate-700 shadow-sm shrink-0 mb-1.5">
                  <span className="material-symbols-outlined text-[#135bec] dark:text-blue-400 text-2xl">face</span>
                </div>
              )}
              
              <div className="flex flex-col gap-1.5 max-w-full">
                <div
                  className={`px-6 py-4 rounded-[2rem] shadow-sm border ${
                    isAi 
                      ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-bl-none' 
                      : 'bg-[#135bec] border-transparent text-white rounded-br-none'
                  }`}
                >
                  {isAi ? (
                    <SeniorFriendlyText text={msg.text} />
                  ) : (
                    <p className="text-xl font-bold leading-tight select-all">
                      {msg.text}
                    </p>
                  )}

                  {isAi && msg.links && msg.links.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-2">
                      {msg.links.map((link, lIdx) => (
                        <a 
                          key={lIdx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-full text-xs font-black text-blue-600 dark:text-blue-300 flex items-center gap-1.5 border border-blue-100/50 hover:bg-blue-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">verified</span> {link.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {isAi && (
                  <div className="flex items-center gap-3 px-2">
                    <button
                      onClick={() => handleSpeak(msg.text, idx)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm ${
                        currentlySpeakingIdx === idx
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#135bec] hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm leading-none">
                        {currentlySpeakingIdx === idx ? 'graphic_eq' : 'volume_up'}
                      </span>
                      <span>{currentlySpeakingIdx === idx ? 'Reading...' : 'Listen Output'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic Thinking/Loader state embedded cleanly in chat stream */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] self-start mr-auto items-end">
            <div className="size-10 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-blue-100 dark:border-slate-700 shadow-sm shrink-0 mb-1.5">
              <span className="material-symbols-outlined text-[#135bec] dark:text-blue-400 text-2xl">face</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 px-6 py-4 rounded-[2rem] rounded-bl-none shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1.5 border border-blue-500/10">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  THINKING...
                </span>
              </div>
              <div className="flex gap-1.5 px-1 py-1">
                <span className="size-2.5 bg-blue-400/80 dark:bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="size-2.5 bg-blue-400/80 dark:bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="size-2.5 bg-blue-400/80 dark:bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Suggesions/FAQs grids loaded when Conversation is in Welcome step */}
        {!loading && messages.length === 1 && (
          <div className="w-full space-y-4 pt-6 mt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center mb-1">
              Popular SautiSahihi Questions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.slice(0, 4).map((faq) => {
                let icon = "quiz";
                const qLower = faq.question.toLowerCase();
                if (qLower.includes("register") || qLower.includes("vote")) icon = "how_to_reg";
                else if (qLower.includes("kiems")) icon = "devices";
                else if (qLower.includes("documents") || qLower.includes("verify")) icon = "verified_user";
                else if (qLower.includes("rights") || qLower.includes("disabled")) icon = "volunteer_activism";

                return (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq)}
                    className="p-5 bg-white dark:bg-slate-800 border-2 border-slate-100/80 dark:border-slate-700/60 rounded-[2rem] text-left shadow-md flex items-start gap-4 hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-slate-700/40 transition-all duration-300 group active:scale-98"
                  >
                    <div className="size-11 bg-blue-50 dark:bg-blue-950/40 rounded-[1rem] flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      <span className="material-symbols-outlined text-[#135bec] dark:text-blue-400 text-xl">{icon}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-lg font-black leading-tight text-slate-700 dark:text-slate-200 block group-hover:text-[#135bec] dark:group-hover:text-blue-300 transition-colors">
                        {faq.question}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block dark:text-slate-500">
                        Frequent Request
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inputs Anchor Panel */}
      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 pt-4 pb-4">
        <div className="p-3 bg-white dark:bg-slate-950/60 rounded-[3rem] shadow-xl border-4 border-blue-50/50 dark:border-slate-800/80 flex items-center gap-2 max-w-2xl mx-auto w-full transition-all duration-300 focus-within:border-blue-100 dark:focus-within:border-blue-900">
          {isSupported && (
            <button 
              onClick={startListening}
              id="assistant-mic-btn"
              title="Speak to Assistant"
              className={`size-14 rounded-full flex items-center justify-center transition-all shrink-0 ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>
          )}
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            id="assistant-input-box"
            className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-2 text-xl font-bold dark:text-white placeholder-slate-400"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            id="assistant-send-btn"
            className="size-14 bg-[#135bec] text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-[#135bec] transition-all duration-150 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-2xl">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
