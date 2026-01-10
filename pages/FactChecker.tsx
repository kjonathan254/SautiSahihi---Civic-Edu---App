import React, { useState } from 'react';
import { AppLanguage, TranslationSet, FactCheckResult, Verdict, GroundingLink } from '../types.ts';
import { factCheckClaim, speakText } from '../geminiService.ts';
import { fileToBase64, hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';

interface Props { lang: AppLanguage; t: TranslationSet; }

const FactChecker: React.FC<Props> = ({ lang, t }) => {
  const [claim, setClaim] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(FactCheckResult & { groundingLinks?: GroundingLink[] }) | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      hapticTap();
      const base64 = await fileToBase64(e.target.files[0]);
      setImage(base64);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ENG' ? 'en-KE' : 'sw-KE';
    recognition.onstart = () => { setIsListening(true); hapticTap(); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setClaim(prev => (prev ? `${prev} ${transcript}` : transcript));
      hapticSuccess();
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleCheck = async () => {
    if (!claim && !image) return;
    hapticTap();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await factCheckClaim(claim, image || undefined, lang);
      setResult(res);
      if (res.verdict === Verdict.TRUE) hapticSuccess();
      else hapticWarning();
    } catch (err) {
      console.error(err);
      setError("We couldn't verify this right now. Please check your internet or API settings.");
      hapticWarning();
    } finally {
      setLoading(false);
    }
  };

  const readVerdict = async () => {
    if (!result || isReading) return;
    setIsReading(true);
    hapticTap();
    try {
      const text = `The verdict is ${result.verdict}. ${result.explanation}`;
      await speakText(text);
    } finally {
      setIsReading(false);
    }
  };

  const shareWithFamily = (type: 'inform' | 'help' = 'inform') => {
    if (!result) return;
    hapticTap();
    const shareText = type === 'help' 
      ? `Jambo! Can you help me check if this news is true? SautiSahihi says it is ${result.verdict}. Source: ${result.sources[0] || 'Official Tally'}`
      : `Important verification for the family: SautiSahihi has marked this as ${result.verdict}. Analysis: ${result.summary}. Let's stay informed!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-[#135bec] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 tracking-tight">{t.factChecker}</h2>
          <p className="text-lg opacity-90 font-bold leading-tight">Verify WhatsApp posters, memes, or newspaper headlines instantly.</p>
        </div>
        <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-[10rem] opacity-10 rotate-12">fact_check</span>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste news text or describe a rumor here..."
            className="w-full p-6 text-xl font-bold border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-lg focus:border-[#135bec] outline-none resize-none h-40 dark:text-white"
          />
          <button
            onClick={handleVoiceInput}
            className={`absolute bottom-6 right-6 size-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${
              isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-gray-700 text-[#135bec]'
            }`}
          >
            <span className="material-symbols-outlined text-4xl">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl font-bold text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading || (!claim && !image)}
          className="w-full bg-[#135bec] text-white py-8 rounded-[2.5rem] font-black text-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-blue-900"
        >
          {loading ? 'SEARCHING SOURCES...' : 'VERIFY TRUTH'}
        </button>

        <label className="cursor-pointer bg-white dark:bg-gray-800 text-[#135bec] p-6 rounded-[2.5rem] flex items-center justify-center gap-3 border-4 border-dashed border-blue-100 shadow-sm">
          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          <span className="material-symbols-outlined text-2xl">add_a_photo</span>
          <span className="font-black">Add Poster or Photo</span>
        </label>
      </div>

      {result && (
        <div className="animate-in zoom-in duration-500">
          <div className={`p-8 rounded-[3.5rem] border-4 shadow-2xl ${
            result.verdict === Verdict.TRUE ? 'border-emerald-500 bg-emerald-50' :
            result.verdict === Verdict.FALSE ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'
          }`}>
            <div className="flex justify-end mb-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-black/10">
                  <span className="material-symbols-outlined text-xs text-blue-600 filled">verified</span>
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Live Grounding Enabled</span>
               </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <span className={`material-symbols-outlined text-[6rem] ${
                result.verdict === Verdict.TRUE ? 'text-emerald-600' : result.verdict === Verdict.FALSE ? 'text-red-600' : 'text-amber-600'
              }`}>
                {result.verdict === Verdict.TRUE ? 'verified' : result.verdict === Verdict.FALSE ? 'error' : 'warning'}
              </span>
              <h3 className="text-5xl font-black uppercase tracking-tighter">{result.verdict}</h3>
              <p className="text-2xl font-black italic opacity-80">{result.summary}</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/50 p-6 rounded-3xl">
                <p className="font-black uppercase text-xs text-gray-400 mb-2 tracking-widest">{t.explanation}</p>
                <p className="text-xl leading-relaxed font-bold">{result.explanation}</p>
                
                <button 
                  onClick={readVerdict}
                  className={`mt-4 flex items-center gap-2 font-black text-[#135bec] py-2 px-4 rounded-xl border-2 border-blue-100 ${isReading ? 'animate-pulse bg-blue-50' : ''}`}
                >
                  <span className="material-symbols-outlined">{isReading ? 'graphic_eq' : 'volume_up'}</span>
                  Listen to Explanation
                </button>
              </div>

              {result.groundingLinks && result.groundingLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="font-black uppercase text-[10px] text-gray-400 tracking-widest px-2">Verified Web Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {result.groundingLinks.map((link, idx) => (
                      <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="bg-white px-4 py-2 rounded-full text-xs font-bold text-blue-600 shadow-sm border border-blue-50 hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">link</span>
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
               <button onClick={() => shareWithFamily('inform')} className="bg-[#25D366] text-white py-5 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3">
                 <span className="material-symbols-outlined">share</span> Inform Family
               </button>
               <button onClick={() => shareWithFamily('help')} className="bg-white text-[#25D366] py-5 rounded-[2.5rem] font-black text-xl border-4 border-[#25D366] flex items-center justify-center gap-3">
                 <span className="material-symbols-outlined">help</span> Ask for Help
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactChecker;