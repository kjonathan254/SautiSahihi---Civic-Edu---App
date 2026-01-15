import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, TranslationSet, GroundingLink } from '../types.ts';
import { chatAssistant } from '../geminiService.ts';
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
    { role: 'ai', text: `Jambo! I am your SautiSahihi Assistant. I can help you understand laws, find offices, or check current news.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;
    
    hapticTap();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);

    if (!isOnline) {
      setMessages(prev => [...prev, { role: 'ai', text: "You are currently offline. I can only provide basic info from my local handbook." }]);
      return;
    }

    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatAssistant(textToSend, lang, history);
      setMessages(prev => [...prev, { role: 'ai', text: response.text, links: response.links }]);
      hapticSuccess();
    } catch (e) {
      hapticWarning();
      setMessages(prev => [...prev, { role: 'ai', text: "Pole, I am having trouble connecting to the network." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranslation = async (index: number) => {
    const msg = messages[index];
    if (msg.role !== 'ai' || loading) return;
    hapticTap();

    const newMessages = [...messages];
    if (msg.isTranslated && msg.originalText) {
      // Revert to original
      newMessages[index] = { ...msg, text: msg.originalText, isTranslated: false };
      setMessages(newMessages);
    } else {
      // Translate using Hugging Face
      setLoading(true);
      try {
        const swahiliText = await translateToKiswahili(msg.text);
        newMessages[index] = { 
          ...msg, 
          originalText: msg.text, 
          text: swahiliText, 
          isTranslated: true 
        };
        setMessages(newMessages);
        hapticSuccess();
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
    hapticSuccess();
  };

  const faqs = CIVIC_FAQS[lang] || CIVIC_FAQS['ENG'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-2 rounded-xl mx-2">
          <span className="material-symbols-outlined text-sm">wifi_off</span>
          Offline Mode
        </div>
      )}

      <div className="bg-[#135bec] p-5 rounded-[2.5rem] text-white shadow-lg mb-4 mx-2">
        <div className="flex items-center gap-4">
          <div className="size-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#135bec] text-4xl filled">face</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">{t.assistant}</h2>
            <p className="text-xs font-bold opacity-80">Respectful Civic Support</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 space-y-6 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'ai' && (
              <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white">
                <span className="material-symbols-outlined text-slate-500 text-xl filled">face</span>
              </div>
            )}
            <div className={`relative max-w-[85%] p-6 rounded-[2.5rem] text-lg shadow-md ${
              m.role === 'user' ? 'bg-[#135bec] text-white rounded-br-none font-bold' : 'bg-white dark:bg-slate-800 dark:text-white border-2 border-slate-50 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              
              {m.role === 'ai' && (
                <button 
                  onClick={() => toggleTranslation(i)}
                  className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    m.isTranslated ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">translate</span>
                  {m.isTranslated ? 'Show Original' : 'Translate to Swahili'}
                </button>
              )}

              {m.links && m.links.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {m.links.map((link, idx) => (
                    <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">link</span> {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-3">
             <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center animate-spin">
                <div className="size-5 border-2 border-[#135bec] border-t-transparent rounded-full"></div>
             </div>
          </div>
        )}
      </div>

      <div className="px-2 pb-4">
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
           {faqs.map((faq, idx) => (
             <button key={idx} onClick={() => handleFaqClick(faq)} className="bg-white dark:bg-slate-800 border-2 border-slate-100 px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-black text-[#135bec] shadow-sm">
               {faq.q}
             </button>
           ))}
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-gray-900 border-t-2 border-gray-100 flex gap-2 items-center sticky bottom-0 z-20 mx-2 mb-2 rounded-[3rem] shadow-2xl">
        {isSupported && (
          <button onClick={startListening} className={`size-16 rounded-full flex items-center justify-center active:scale-90 transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-gray-800 text-[#135bec]'}`}>
            <span className="material-symbols-outlined text-4xl">{isListening ? 'graphic_eq' : 'mic'}</span>
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none dark:text-white font-bold"
        />
        <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="bg-[#135bec] text-white size-16 rounded-full flex items-center justify-center shadow-xl disabled:opacity-40">
          <span className="material-symbols-outlined text-4xl">send</span>
        </button>
      </div>
    </div>
  );
};

export default Assistant;