
import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { chatAssistant } from '../geminiService.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';
// Fix: Removed IEBC_HOTLINES which was not exported from constants.tsx
import { IEBC_HQ_INFO, CIVIC_FAQS } from '../constants.tsx';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const Assistant: React.FC<Props> = ({ lang, t }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Answer: Jambo! I am your SautiSahihi Assistant. I am here to help you understand our laws and voting rights clearly. You can type your question below or use the microphone to speak to me.\nSource: Constitution of Kenya\nUser Question: Hello` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const parseAIResponse = (text: string) => {
    const answerMatch = text.match(/Answer:\s*([\s\S]*?)(?=Source:|$)/i);
    const sourceMatch = text.match(/Source:\s*([\s\S]*?)(?=User Question:|$)/i);
    
    return {
      answer: answerMatch ? answerMatch[1].trim() : text,
      source: sourceMatch ? sourceMatch[1].trim() : "Verified Documents"
    };
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;
    
    hapticTap();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);

    if (!isOnline) {
      setMessages(prev => [...prev, { role: 'ai', text: "Answer: You are currently offline. Please use the Quick Answers below for common civic guidance, or connect to the internet to ask me anything else.\nSource: Offline Cache\nUser Question: " + textToSend }]);
      return;
    }

    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatAssistant(textToSend, lang, history);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      hapticSuccess();
    } catch (e) {
      hapticWarning();
      setMessages(prev => [...prev, { role: 'ai', text: "Answer: Pole, my connection is weak. Please try again.\nSource: System\nUser Question: " + textToSend }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFaqClick = (faq: { q: string, a: string }) => {
    hapticTap();
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: faq.q },
      { role: 'ai', text: `Answer: ${faq.a}\nSource: SautiSahihi Civic Handbook (Offline)\nUser Question: ${faq.q}` }
    ]);
    hapticSuccess();
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ENG' ? 'en-KE' : 'sw-KE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      hapticTap();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.onerror = () => {
      hapticWarning();
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const faqs = CIVIC_FAQS[lang] || CIVIC_FAQS['ENG'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      {/* Connection Status Badge */}
      {!isOnline && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-2 rounded-xl mx-2 border border-amber-200 dark:border-amber-800 animate-pulse">
          <span className="material-symbols-outlined text-sm">wifi_off</span>
          Offline Mode: Using Cached Handbook
        </div>
      )}

      {/* Official Help Center Dock */}
      <div className="bg-[#135bec] p-5 rounded-[2.5rem] text-white shadow-lg flex-shrink-0 mb-4 mx-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-14 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[#135bec] text-4xl filled">face</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">{t.assistant}</h2>
            <p className="text-xs font-bold opacity-80 italic leading-none">Respectful Civic Support</p>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-3xl border border-white/20 space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Official IEBC Helpdesk</span>
              <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Always Ready</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${IEBC_HQ_INFO.phone}`} className="flex items-center gap-3 bg-white text-[#135bec] p-3 rounded-2xl active:scale-95 transition-transform">
                 <span className="material-symbols-outlined text-2xl">call</span>
                 <span className="font-black text-sm">Call HQ</span>
              </a>
              <a href={`https://wa.me/${IEBC_HQ_INFO.whatsapp}`} target="_blank" className="flex items-center gap-3 bg-emerald-500 text-white p-3 rounded-2xl active:scale-95 transition-transform">
                 <span className="material-symbols-outlined text-2xl">chat</span>
                 <span className="font-black text-sm">WhatsApp</span>
              </a>
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar pb-4">
        {messages.map((m, i) => {
          const isAI = m.role === 'ai';
          const parsed = isAI ? parseAIResponse(m.text) : null;
          
          return (
            <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {isAI && (
                <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm mb-1">
                  <span className="material-symbols-outlined text-slate-500 text-xl filled">face</span>
                </div>
              )}
              <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-lg shadow-md ${
                m.role === 'user' 
                  ? 'bg-[#135bec] text-white rounded-br-none font-bold' 
                  : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border-2 border-slate-50 dark:border-slate-700 rounded-bl-none'
              }`}>
                {isAI ? (
                  <div className="space-y-4">
                    <div className="leading-relaxed font-medium whitespace-pre-wrap">
                      {parsed?.answer.split('\n').map((line, idx) => {
                        const isUrl = line.includes('https://');
                        return isUrl ? (
                          <a key={idx} href={line.split(': ')[1]} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline font-black my-1 break-all">
                            {line}
                          </a>
                        ) : <p key={idx}>{line}</p>;
                      })}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#135bec]">Source:</span>
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-[#135bec] font-black italic">
                        {parsed?.source}
                      </span>
                    </div>
                  </div>
                ) : (
                  m.text
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start items-center gap-3">
             <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <div className="size-5 border-2 border-[#135bec] border-t-transparent rounded-full animate-spin"></div>
             </div>
             <div className="bg-white dark:bg-gray-800 border-2 border-slate-50 dark:border-slate-700 p-5 rounded-3xl rounded-bl-none italic text-gray-400 font-bold uppercase text-[10px] tracking-widest shadow-sm">
               Searching verified sources...
             </div>
          </div>
        )}
      </div>

      {/* Quick Answers (FAQs) - Always available, crucial for offline */}
      <div className="px-2 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 px-2">Quick Handbook Answers</p>
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
           {faqs.map((faq, idx) => (
             <button
              key={idx}
              onClick={() => handleFaqClick(faq)}
              className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-black text-[#135bec] shadow-sm active:scale-95 transition-transform shrink-0"
             >
               {faq.q}
             </button>
           ))}
        </div>
      </div>

      {/* Voice Visualizer Overlay */}
      {isListening && (
        <div className="fixed inset-0 z-50 bg-[#135bec]/95 flex flex-col items-center justify-center text-white animate-in fade-in duration-300 backdrop-blur-md">
           <div className="size-48 bg-white/20 rounded-full flex items-center justify-center animate-pulse border-8 border-white/10">
              <span className="material-symbols-outlined text-9xl">mic</span>
           </div>
           <h3 className="text-4xl font-black mt-8 uppercase tracking-tighter">I'm Listening...</h3>
           <p className="text-xl opacity-80 mt-2 font-bold italic">Speak your question clearly</p>
           <button onClick={() => setIsListening(false)} className="mt-12 bg-white text-[#135bec] px-12 py-5 rounded-full font-black text-2xl shadow-2xl active:scale-90 transition-transform">
              CANCEL
           </button>
        </div>
      )}

      {/* Input Dock */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t-2 border-gray-100 dark:border-gray-800 flex gap-2 items-center sticky bottom-0 z-20 mx-2 mb-2 rounded-[3rem] shadow-2xl">
        <button
          onClick={handleVoiceInput}
          className="bg-slate-100 dark:bg-gray-800 text-[#135bec] size-16 rounded-full flex items-center justify-center shadow-inner active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-4xl">mic</span>
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isOnline ? "Ask about laws, locations..." : "Type here (Limited offline mode)"}
          className="flex-1 px-4 py-4 text-lg bg-transparent border-none focus:ring-0 outline-none dark:text-white font-bold"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="bg-[#135bec] text-white size-16 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-4xl">send</span>
        </button>
      </div>
    </div>
  );
};

export default Assistant;
