
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, Language, VerificationResult, ChatMessage, Briefing, GroundingLink } from './types';
import Layout from './components/Layout';
import { factCheckMessage, generateBriefingAudio, decodeBase64Audio, createAudioBuffer, startCivicChat, generateElectionVisual, fetchRealtimeStanding } from './services/geminiService';

// Logo Component for reliable loading and consistent branding
const SautiLogo: React.FC<{ size?: string; className?: string }> = ({ size = "100%", className = "" }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="boxGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#135bec', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0f4bc4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="85" fill="white" />
    <rect x="60" y="80" width="80" height="70" rx="8" fill="url(#boxGradDash)" />
    <path d="M60 88 L100 110 L140 88" fill="none" stroke="white" strokeWidth="3" opacity="0.3" />
    <rect x="85" y="75" width="30" height="8" rx="2" fill="#0f4bc4" />
    <circle cx="130" cy="80" r="28" fill="#10b981" />
    <path d="M120 80 L127 87 L140 73" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Mock Candidates for the practice poll
const MOCK_CANDIDATES = [
  { id: 'cand_a', name: 'Coalition A', color: 'bg-primary' },
  { id: 'cand_b', name: 'Movement B', color: 'bg-emerald-500' },
  { id: 'cand_c', name: 'Alliance C', color: 'bg-amber-500' }
];

// Helper component to make URLs clickable in chat
const LinkifyText: React.FC<{ text: string }> = ({ text }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => 
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline break-all font-bold hover:opacity-80">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// Component to render Grounding Links
const GroundingLinks: React.FC<{ links?: GroundingLink[] }> = ({ links }) => {
  if (!links || links.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Sources:</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link, i) => (
          <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xs">link</span>
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
};

const MOODS = [
  { id: 'peace', label: 'Peaceful Voting', icon: 'volunteer_activism', prompt: "Kenyan citizens of diverse ages queuing peacefully and orderly at a bright, official IEBC polling station during a sunny day, high spirit of democracy." },
  { id: 'dialogue', label: 'Community Dialogue', icon: 'groups', prompt: "A group of Kenyan elders and youth sitting under a large acacia tree in a rural setting, engaged in a respectful and calm discussion about civic duties." },
  { id: 'education', label: 'Voter Education', icon: 'history_edu', prompt: "A clean, modern community hall in Kenya where a trainer is showing senior citizens how to use a biometric kit, dignified and empowering atmosphere." }
];

const LEARN_TOPICS = [
  { id: 'registration_resume', title: "Voter Registration 2026", desc: "Continuous voter registration is set to resume in 2026 across all 290 constituencies in preparation for the 2027 General Elections.", icon: "event_repeat", prompt: "A modern Kenyan calendar showing the year 2026 with a voter registration mark, set in a clean, hopeful office environment." },
  { id: 'how_to_register', title: "How to Register as a Voter", desc: "To register, you must be a Kenyan citizen, 18 years or older, with a valid National ID or Passport. Visit any IEBC constituency office.", icon: "how_to_reg", prompt: "A close-up of a valid Kenyan National Identity card resting on an official registration form, with a professional and welcoming background." },
  { id: 'voter_verification', title: "Verify Your Voter Status", desc: "Ensure your details are correct by visiting the official IEBC portal at verify.iebc.or.ke or visiting your local registration center.", icon: "fact_check", prompt: "A senior Kenyan man smiling while looking at a tablet screen displaying the official IEBC verification portal, feeling confident and informed.", url: "https://verify.iebc.or.ke/" },
  { id: 'ballot', title: "The 6-Ballot System", desc: "Why we vote for 6 positions and who they are in the Kenyan general election.", icon: "ballot", prompt: "A dignified Kenyan senior citizen marking one of six colorful ballots in a bright, orderly polling station. Sunlight streaming through a window, atmosphere of pride and duty." },
  { id: 'rights', title: "Your Rights as a Senior", desc: "Understanding priority queuing, physical assistance, and your dignity at the polls.", icon: "shield_person", prompt: "A young Kenyan election official respectfully assisting an elderly woman in a wheelchair at a priority queue in a polling station. Warm, helpful, and community-focused atmosphere." },
  { id: 'kiems', title: "KIEMS Kit Guide", desc: "How the digital verification kit identifies you safely using fingerprints and facial features.", icon: "fingerprint", prompt: "A close-up of a senior Kenyan voter's hand being placed on a KIEMS biometric kit sensor. The device is modern and clear. Background shows a blurred but orderly polling room." }
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [lang, setLang] = useState<Language>('ENG');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastVerifyResult, setLastVerifyResult] = useState<VerificationResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [moodImage, setMoodImage] = useState<string | null>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [activeMood, setActiveMood] = useState(MOODS[0].id);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInputValue, setChatInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Results State
  const [mockVotes, setMockVotes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sautisahih_mock_votes');
    return saved ? JSON.parse(saved) : { cand_a: 12450, cand_b: 11200, cand_c: 8900 };
  });
  const [hasVoted, setHasVoted] = useState(localStorage.getItem('sautisahih_has_voted') === 'true');
  const [electionStanding, setElectionStanding] = useState<string | null>(null);
  const [standingLinks, setStandingLinks] = useState<GroundingLink[]>([]);
  const [standingLoading, setStandingLoading] = useState(false);

  // AI Generated Thumbnails for Learn section
  const [learnImages, setLearnImages] = useState<Record<string, string>>({});
  const [learnImagesLoading, setLearnImagesLoading] = useState<Record<string, boolean>>({});
  
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('th_lang');
    if (savedLang) setLang(savedLang as Language);
    
    // Initial mood generation
    fetchMood(MOODS[0].prompt);
  }, []);

  useEffect(() => {
    if (screen === AppScreen.RESULTS) {
      handleFetchStanding();
    }
  }, [screen, lang]);

  const handleFetchStanding = async () => {
    setStandingLoading(true);
    try {
      const result = await fetchRealtimeStanding(lang);
      setElectionStanding(result.text);
      setStandingLinks(result.groundingLinks);
    } catch (error) {
      console.error(error);
    } finally {
      setStandingLoading(false);
    }
  };

  const fetchMood = async (prompt: string) => {
    setMoodLoading(true);
    const img = await generateElectionVisual(prompt);
    if (img) setMoodImage(img);
    setMoodLoading(false);
  };

  const handleMoodSelect = (moodId: string) => {
    const mood = MOODS.find(m => m.id === moodId);
    if (mood) {
      setActiveMood(moodId);
      fetchMood(mood.prompt);
    }
  };

  const handleCastVote = (candidateId: string) => {
    if (hasVoted) return;
    const currentCount = mockVotes[candidateId] || 0;
    const newVotes = { ...mockVotes, [candidateId]: (currentCount as number) + 1 };
    setMockVotes(newVotes);
    setHasVoted(true);
    localStorage.setItem('sautisahih_mock_votes', JSON.stringify(newVotes));
    localStorage.setItem('sautisahih_has_voted', 'true');
    triggerHaptic('success');
  };

  useEffect(() => {
    if (screen === AppScreen.LEARN) {
      LEARN_TOPICS.forEach(async (topic) => {
        if (!learnImages[topic.id] && !learnImagesLoading[topic.id]) {
          setLearnImagesLoading(prev => ({ ...prev, [topic.id]: true }));
          const img = await generateElectionVisual(topic.prompt);
          if (img) {
            setLearnImages(prev => ({ ...prev, [topic.id]: img }));
          }
          setLearnImagesLoading(prev => ({ ...prev, [topic.id]: false }));
        }
      });
    }
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('th_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    if ((screen === AppScreen.CHAT || screen === AppScreen.OFFICE_LOCATOR)) {
      chatSessionRef.current = startCivicChat(lang);
      const welcomeMsg = lang === 'ENG' 
        ? "Hello! I am your SautiSahihi Civic Assistant. I can check real-time news for you today. How can I help?"
        : lang === 'KIS' ? "Jambo! Mimi ni msaidizi wako wa SautiSahihi. Ninaweza kuangalia habari za sasa hivi kwa ajili yako. Naweza kukusaidia vipi?"
        : "Jambo! I am ready to help you in your local language.";
      setChatMessages([{ role: 'model', text: welcomeMsg }]);
    }
  }, [screen, lang]);

  const triggerHaptic = (type: 'success' | 'warning' | 'click' = 'click') => {
    if (window.navigator && window.navigator.vibrate) {
      if (type === 'success') window.navigator.vibrate([100, 30, 100]);
      else if (type === 'warning') window.navigator.vibrate([200, 50, 200]);
      else window.navigator.vibrate(40);
    }
  };

  const handleVerify = async () => {
    setVerifyLoading(true);
    try {
      const result = await factCheckMessage(chatInputValue, selectedImage || undefined);
      setLastVerifyResult(result);
      triggerHaptic(result.verdict === 'TRUE' ? 'success' : 'warning');
      setScreen(AppScreen.VERIFY_RESULT);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInputValue;
    if (!textToSend.trim() || isChatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInputValue('');

    setIsChatLoading(true);
    try {
      const response = await chatSessionRef.current.sendMessage({ message: textToSend });
      
      const groundingLinks: GroundingLink[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title || "Source" });
        });
      }

      setChatMessages(prev => [...prev, { role: 'model', text: response.text, groundingLinks }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Service error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePlayAudio = async (text: string) => {
    setAudioLoading(true);
    try {
      const base64 = await generateBriefingAudio(text, lang);
      if (base64) {
        const audioData = decodeBase64Audio(base64);
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await createAudioBuffer(audioData, audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAudioLoading(false);
    }
  };

  const shareWithFamily = (type: 'help' | 'inform' = 'inform') => {
    if (!lastVerifyResult) return;
    const shareText = type === 'help' 
      ? `Hi! Can you help me check if this news is true? SautiSahihi says it is ${lastVerifyResult.verdict}. Source: ${lastVerifyResult.source}`
      : `Important verification for the family: SautiSahihi has marked this as ${lastVerifyResult.verdict}. Logic: ${lastVerifyResult.explanation}`;
    
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const openWhatsAppHumanHelp = () => {
    const msg = "Hello! I have a question for SautiSahihi human support.";
    window.open(`https://wa.me/254711707229?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const LanguageSelector = () => (
    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap">
      {[
        { id: 'ENG', label: 'ENG' },
        { id: 'KIS', label: 'KIS' },
        { id: 'GIK', label: 'GIK' },
        { id: 'DHO', label: 'DHO' },
        { id: 'LUH', label: 'LUH' }
      ].map((l) => (
        <button 
          key={l.id}
          onClick={() => {
            setLang(l.id as Language);
            triggerHaptic();
          }} 
          className={`px-5 py-3 rounded-full text-xs font-black transition-all ${lang === l.id ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (screen) {
      case AppScreen.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center space-y-8 animate-fade-in">
            <div className="size-48 bg-white rounded-full flex items-center justify-center shadow-2xl relative border-4 border-primary p-4">
              <SautiLogo size="100%" />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 size-12 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">chat</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">SautiSahihi</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-[280px] mx-auto">
                Democracy. Dignity. Inclusion.
              </p>
            </div>

            <div className="w-full space-y-4">
              <button 
                onClick={() => {
                  setScreen(AppScreen.DASHBOARD);
                  triggerHaptic();
                }}
                className="w-full py-6 bg-primary text-white rounded-[2.5rem] text-3xl font-black shadow-xl active:scale-95 transition-transform"
              >
                ENTER APP
              </button>
              
              <button 
                onClick={openWhatsAppHumanHelp}
                className="w-full py-5 bg-emerald-500 text-white rounded-[2.5rem] text-xl font-black shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl">contact_support</span>
                CHAT WITH HUMAN
              </button>

              <div className="pt-4 flex flex-col items-center gap-4">
                <LanguageSelector />
              </div>
            </div>
          </div>
        );

      case AppScreen.DASHBOARD:
        return (
          <div className="p-4 space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700">
                {moodLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm z-20">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-black uppercase text-primary tracking-widest">Updating Vision...</span>
                  </div>
                ) : moodImage ? (
                  <img src={moodImage} className="w-full h-full object-cover transition-transform duration-700" alt="Election mood" />
                ) : null}
                
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
                    <p className="text-white font-black text-xl italic tracking-tight drop-shadow-md">
                      {activeMood === 'peace' && '"Peace starts with a dignified vote."'}
                      {activeMood === 'dialogue' && '"Elder wisdom, Youth energy."'}
                      {activeMood === 'education' && '"Truth is our greatest shield."'}
                    </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((mood) => (
                  <button 
                    key={mood.id}
                    onClick={() => {
                      handleMoodSelect(mood.id);
                      triggerHaptic();
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-3xl transition-all border-2 ${
                      activeMood === mood.id ? 'bg-primary border-primary text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl mb-1">{mood.icon}</span>
                    <span className="text-[10px] font-black uppercase text-center leading-tight">{mood.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => {
                setScreen(AppScreen.VERIFY_INPUT);
                triggerHaptic();
              }} className="w-full p-8 bg-amber-500 text-white rounded-[2.5rem] shadow-lg flex items-center gap-6 active:scale-98 transition-transform">
                <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">fact_check</span>
                </div>
                <div className="text-left">
                  <h4 className="font-black text-2xl tracking-tight">Fact Checker</h4>
                  <p className="font-bold opacity-90 text-sm italic">Uses Google Search for Accuracy</p>
                </div>
              </button>

              <button onClick={() => {
                setScreen(AppScreen.RESULTS);
                triggerHaptic();
              }} className="w-full p-8 bg-primary text-white rounded-[2.5rem] shadow-lg flex items-center gap-6 active:scale-98 transition-transform">
                <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">monitoring</span>
                </div>
                <div className="text-left">
                  <h4 className="font-black text-2xl tracking-tight">Live Results</h4>
                  <p className="font-bold opacity-90 text-sm italic">Real-time Standing & Mock Poll</p>
                </div>
              </button>

              <button onClick={openWhatsAppHumanHelp} className="w-full p-6 bg-emerald-500 text-white rounded-[2.5rem] shadow-lg flex items-center gap-6 active:scale-98 transition-transform">
                <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <div className="text-left">
                  <h4 className="font-black text-xl tracking-tight">Call for Backup</h4>
                  <p className="font-bold opacity-90 text-xs">Human Coordinator: +254 711 707 229</p>
                </div>
              </button>
            </div>
          </div>
        );

      case AppScreen.RESULTS:
        const totalVotes = (Object.values(mockVotes) as number[]).reduce((a: number, b: number) => a + b, 0);
        return (
          <div className="p-4 space-y-6 animate-fade-in pb-24">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black dark:text-white tracking-tighter">Live Results</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-full animate-pulse">
                <div className="size-2 bg-rose-600 rounded-full"></div>
                <span className="text-[10px] font-black uppercase">Live Updates</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-8">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">SautiSahihi Community Poll</h3>
                <p className="text-slate-500 font-bold italic">Cast your practice vote to see tallies update.</p>
              </div>

              <div className="space-y-6">
                {MOCK_CANDIDATES.map((cand) => {
                  const percentage = totalVotes > 0 
                    ? (((mockVotes[cand.id] || 0) / totalVotes) * 100).toFixed(1) 
                    : "0.0";
                  return (
                    <div key={cand.id} className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xl font-black dark:text-white">{cand.name}</span>
                        <span className="text-xl font-black text-primary">{percentage}%</span>
                      </div>
                      <div className="h-6 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full ${cand.color} transition-all duration-1000 ease-out`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between px-2">
                         <span className="text-[10px] font-black uppercase text-slate-400">Total: {(mockVotes[cand.id] || 0).toLocaleString()}</span>
                         {!hasVoted && (
                           <button 
                            onClick={() => handleCastVote(cand.id)}
                            className="text-[10px] font-black uppercase text-primary underline"
                           >
                            Practice Vote
                           </button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasVoted && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl border border-emerald-100 dark:border-emerald-800 text-center">
                  <p className="text-emerald-700 dark:text-emerald-400 font-black italic">"Thank you for practicing your democratic right!"</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">insights</span>
                    <h3 className="text-2xl font-black tracking-tight uppercase">Latest Election Context</h3>
                  </div>
                  
                  {standingLoading ? (
                    <div className="flex flex-col items-center py-8 gap-4">
                      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Scanning verified sources...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-lg font-medium leading-relaxed text-slate-300 italic">
                        {electionStanding || "No news found. Check back soon."}
                      </p>
                      <GroundingLinks links={standingLinks} />
                    </div>
                  )}

                  <button 
                    onClick={handleFetchStanding}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center gap-2 font-black transition-all"
                  >
                    <span className="material-symbols-outlined">refresh</span> REFRESH NEWS
                  </button>
               </div>
               <div className="absolute -bottom-10 -right-10 size-40 bg-primary opacity-10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] border border-amber-200 dark:border-amber-800 space-y-3">
               <div className="flex items-center gap-3 text-amber-600">
                  <span className="material-symbols-outlined">warning</span>
                  <span className="font-black uppercase tracking-widest text-xs">Official Results Warning</span>
               </div>
               <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  The tally above is a community simulation. For official Kenyan election results, always refer solely to the 
                  <span className="text-amber-700 font-black"> Independent Electoral and Boundaries Commission (IEBC)</span> portal.
               </p>
            </div>
          </div>
        );

      case AppScreen.VERIFY_INPUT:
        return (
          <div className="p-6 space-y-6 animate-fade-in">
            <h2 className="text-4xl font-black dark:text-white tracking-tighter leading-none mb-4">Verify News</h2>
            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined">search_check</span>
                <span className="font-black text-sm uppercase tracking-widest">Real-Time Search Enabled</span>
              </div>
              <p className="text-xs font-medium text-slate-500">I will use Google Search to cross-reference your message with official Kenyan government and media sources.</p>
            </div>

            <div className="space-y-4">
              <div 
                onClick={() => {
                  fileInputRef.current?.click();
                  triggerHaptic();
                }}
                className={`w-full aspect-video rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 ${
                  selectedImage ? 'border-primary' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {selectedImage ? <img src={selectedImage} className="w-full h-full object-cover" /> : (
                  <>
                    <span className="material-symbols-outlined text-6xl text-slate-300">add_a_photo</span>
                    <p className="font-black text-slate-400 mt-4 text-xl">Upload Poster/Photo</p>
                  </>
                )}
                <input type="file" hidden ref={fileInputRef} onChange={handleImageSelect} accept="image/*" />
              </div>
              <textarea 
                className="w-full h-40 p-6 bg-white dark:bg-slate-800 border-2 border-slate-200 rounded-[2.5rem] text-xl font-bold outline-none dark:text-white"
                placeholder="Paste the WhatsApp text here..."
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
              />
            </div>
            <button 
              disabled={verifyLoading || (!chatInputValue && !selectedImage)}
              onClick={() => {
                handleVerify();
                triggerHaptic();
              }}
              className="w-full py-6 bg-primary text-white rounded-full text-3xl font-black shadow-xl disabled:opacity-50"
            >
              {verifyLoading ? 'CHECKING SOURCES...' : 'VERIFY NOW'}
            </button>
          </div>
        );

      case AppScreen.VERIFY_RESULT:
        if (!lastVerifyResult) return null;
        return (
          <div className="p-6 space-y-6 pb-24 animate-fade-in">
             <div className={`p-10 rounded-[4rem] border-4 flex flex-col items-center text-center space-y-4 shadow-xl ${
              lastVerifyResult.verdict === 'TRUE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
              lastVerifyResult.verdict === 'FALSE' ? 'bg-rose-50 border-rose-500 text-rose-700' :
              'bg-amber-50 border-amber-500 text-amber-700'
            }`}>
              <span className="material-symbols-outlined text-9xl">
                {lastVerifyResult.verdict === 'TRUE' ? 'verified' : lastVerifyResult.verdict === 'FALSE' ? 'error' : 'warning'}
              </span>
              <h2 className="text-6xl font-black tracking-tighter uppercase">{lastVerifyResult.verdict}</h2>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-lg space-y-6 border border-slate-100 dark:border-slate-700">
               <p className="text-2xl font-black dark:text-white tracking-tight">SautiSahihi Analysis:</p>
               <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-snug">{lastVerifyResult.explanation}</p>
               
               <GroundingLinks links={lastVerifyResult.groundingLinks} />

               <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Intergenerational Bridge:</p>
                  <button onClick={() => shareWithFamily('inform')} className="w-full py-4 bg-emerald-500 text-white rounded-3xl font-black text-xl shadow-lg flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined">share</span> Inform Family
                  </button>
               </div>
            </div>

            <button onClick={() => {
              setScreen(AppScreen.DASHBOARD);
              triggerHaptic();
            }} className="w-full py-5 border-4 border-slate-200 rounded-full text-2xl font-black dark:text-white">
              Back to Dashboard
            </button>
          </div>
        );

      case AppScreen.CHAT:
        return (
          <div className="flex flex-col h-[calc(100vh-160px)] animate-fade-in">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-xl font-bold shadow-md ${
                    msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    <LinkifyText text={msg.text} />
                    <GroundingLinks links={msg.groundingLinks} />
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="px-6 py-2 text-primary font-black animate-pulse text-xl uppercase tracking-widest">SautiSahihi is searching...</div>}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t flex gap-3 items-center shadow-2xl">
              <button 
                onMouseDown={() => { setIsRecording(true); triggerHaptic(); }}
                onMouseUp={() => { setIsRecording(false); handleSendMessage("Explain the voter registration process clearly."); }}
                className={`size-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-rose-500 scale-110' : 'bg-slate-100 text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-4xl">{isRecording ? 'graphic_eq' : 'mic'}</span>
              </button>
              <input 
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-[3rem] px-6 py-5 text-xl font-bold dark:text-white focus:border-primary outline-none"
                placeholder="Ask your question..."
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={() => handleSendMessage()} className="size-16 bg-primary text-white rounded-full flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        );

      case AppScreen.LEARN:
        return (
          <div className="p-4 space-y-6 animate-fade-in">
             <h2 className="text-4xl font-black dark:text-white tracking-tighter mb-4">Civic Education</h2>
             <div className="space-y-8">
                {LEARN_TOPICS.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col group">
                     <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-900">
                        {learnImagesLoading[item.id] ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900">
                             <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                             <span className="text-[10px] font-black uppercase text-slate-400">Visualizing...</span>
                          </div>
                        ) : learnImages[item.id] ? (
                          <img src={learnImages[item.id]} className="w-full h-full object-cover" alt={item.title} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-200">{item.icon}</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                     </div>

                     <div className="p-8 space-y-4">
                        <h4 className="text-2xl font-black dark:text-white leading-tight">{item.title}</h4>
                        <p className="text-lg font-medium text-slate-500 leading-snug">{item.desc}</p>
                        <div className="flex flex-col gap-2 pt-2">
                           <button onClick={() => {
                             handlePlayAudio(item.desc);
                             triggerHaptic();
                           }} className="w-full py-4 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 font-black">
                              <span className="material-symbols-outlined">volume_up</span> LISTEN TO AUDIO
                           </button>
                           <button 
                             onClick={() => {
                               if (item.url) window.open(item.url, '_blank');
                               triggerHaptic();
                             }}
                             className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg"
                           >
                              {item.url ? 'VISIT PORTAL' : 'READ FULL GUIDE'}
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        );

      case AppScreen.PROFILE:
        return (
          <div className="p-6 space-y-8 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="size-32 bg-primary rounded-full flex items-center justify-center text-white shadow-xl">
                <span className="material-symbols-outlined text-6xl">person</span>
              </div>
              <h3 className="text-3xl font-black dark:text-white tracking-tighter">My Account</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-md space-y-6">
               <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-slate-400">App Language</p>
                  <LanguageSelector />
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xl font-black dark:text-white">Night Mode</span>
                  <button 
                    onClick={() => { setIsDarkMode(!isDarkMode); triggerHaptic(); }}
                    className={`w-16 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-slate-200'} relative`}
                  >
                    <div className={`size-6 bg-white rounded-full shadow absolute top-1 transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-center space-y-4 shadow-2xl">
               <h4 className="text-emerald-400 font-black text-2xl">Human Coordinator</h4>
               <p className="text-slate-400 font-bold leading-tight">If you need immediate help, message me directly.</p>
               <button onClick={openWhatsAppHumanHelp} className="w-full py-5 bg-emerald-500 text-white rounded-full font-black text-xl">
                  WhatsApp Support
               </button>
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-center font-black">Screen Missing</div>;
    }
  };

  return (
    <Layout 
      activeScreen={screen} 
      onNavigate={(s) => { setScreen(s); triggerHaptic(); }}
      title={screen === AppScreen.WELCOME ? "" : "SautiSahihi"}
      showBack={screen !== AppScreen.WELCOME && screen !== AppScreen.DASHBOARD}
      onBack={() => { setScreen(AppScreen.DASHBOARD); triggerHaptic(); }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
