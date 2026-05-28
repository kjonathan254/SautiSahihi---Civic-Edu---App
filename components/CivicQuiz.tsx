import React, { useState } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { hapticTap, hapticSuccess, hapticWarning } from '../utils.ts';
import { speakText } from '../geminiService.ts';

interface QuizProps {
  lang: AppLanguage;
  t: TranslationSet;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isMyth?: boolean;
}

const QUIZ_MODULES: Record<string, { title: string; desc: string; icon: string; questions: Question[] }> = {
  constitution: {
    title: "Know Your Constitution",
    desc: "Test your knowledge on key rights, Article 38, and devolved governance.",
    icon: "gavel",
    questions: [
      {
        id: 1,
        question: "Which Article of the Kenyan Constitution guarantees your right to register as a voter and cast a secret ballot in peace?",
        options: ["Article 10", "Article 38", "Article 81", "Article 201"],
        correctIndex: 1,
        explanation: "Article 38 of the Constitution guarantees the absolute political right of every citizen to register as a voter and vote in any election or referendum by secret ballot."
      },
      {
        id: 2,
        question: "Under the devolved system of county governance, how many visual ballot choices does a voter make during a general election?",
        options: ["3 choices", "5 choices", "6 choices", "8 choices"],
        correctIndex: 2,
        explanation: "You vote for six distinct roles: President, Governor, Senator, Member of Parliament, County Woman Representative, and Member of County Assembly (MCA)."
      },
      {
        id: 3,
        question: "According to Article 201 and public finance laws, at least what percentage of any county budget must go directly to development projects?",
        options: ["10 percent", "20 percent", "30 percent", "50 percent"],
        correctIndex: 2,
        explanation: "Article 201 and the Public Finance Management (PFM) Act state that a minimum of thirty percent (30%) of a county government's budget must be spent on development projects like infrastructure, clinics, and water pipings over the medium term."
      }
    ]
  },
  simulator: {
    title: "IEBC Process Simulator",
    desc: "Interactive scenarios: what to do if your name is missing, biometrics fail, or you need help.",
    icon: "psychology",
    questions: [
      {
        id: 1,
        question: "Scenario: You arrive at your polling stream on election day, but your name is missing from the printed paper roster. What is your correct action?",
        options: [
          "Leave quietly and report the issue to neighbors",
          "Ask the Presiding Officer to immediately search you in the digital KIEMS kit or check the supplementary alpha list",
          "Attempt to vote in a different constituency stream",
          "Demand a manual paper ballot from any clerk without verification"
        ],
        correctIndex: 1,
        explanation: "IEBC rules dictate that the Presiding Officer has access to a digital register on the KIEMS kit and an alphabetical supplementary register to locate registered voters."
      },
      {
        id: 2,
        question: "Scenario: The KIEMS kit biometric fingerprint scan fails to identify your thumbprint. What is the verified backup procedure?",
        options: [
          "You are turned away from voting immediately",
          "Clerks execute an alphanumeric search using your National ID card number, followed by document matching and physical supervisor sign-off",
          "A relative votes on your behalf",
          "The clerk overrides the system without documentation"
        ],
        correctIndex: 1,
        explanation: "If biometrics fail, the official fallback is an alphanumeric search on the KIEMS kit using your physical National ID/Passport number, verified by physical matching and a supervisor authorization form."
      },
      {
        id: 3,
        question: "What is the official maximum number of voters allowed in a single polling stream to prevent long queues?",
        options: ["400 voters", "700 voters", "1,000 voters", "1,500 voters"],
        correctIndex: 1,
        explanation: "IEBC limits each printed KIEMS stream to a maximum of 700 voters to ensure lines move quickly and safely."
      }
    ]
  },
  mythbusters: {
    title: "Civic Myth vs Fact",
    desc: "Identify truth from election rumors and test your media literacy wheels.",
    icon: "campaign",
    questions: [
      {
        id: 1,
        question: "Myth or Fact? 'If you lose your National ID card, you can still vote by showing a photostatic copy or your old voter registration card.'",
        options: ["FACT (I can vote with a copy)", "MYTH (Only original physical ID or valid Passport is allowed)"],
        correctIndex: 1,
        explanation: "This is a myth. By law or IEBC guidelines, you MUST carry your original physical National ID or original physical Passport that matches your registration details on election day."
      },
      {
        id: 2,
        question: "Myth or Fact? 'The Constitution of Kenya guarantees elderly electors, pregnant mothers, and citizens with disabilities the right to be expedited and bypass any long queues.'",
        options: ["FACT (They have express priority)", "MYTH (Everyone must stand in the standard line)"],
        correctIndex: 0,
        explanation: "This is a absolute Fact. Article 54 guarantees accessibility, and IEBC protocols strictly require prioritizing senior citizens, expectant mothers, and voters with disabilities to vote quickly."
      },
      {
        id: 3,
        question: "Myth or Fact? 'A parliamentary or MCA candidate is legally disqualified if they have not resided inside the boundary of that specific constituency or ward.'",
        options: ["FACT (They must live inside the lines)", "MYTH (They must be registered voters in Kenya, but residence inside is not a direct disqualification)"],
        correctIndex: 1,
        explanation: "This is a myth. Candidates are required to be registered voters, but physical residential location inside that exact border is not a constitutional disqualification, although local ties are highly valued."
      }
    ]
  }
};

export const CivicQuiz: React.FC<QuizProps> = ({ lang, t }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userName, setUserName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState<number | null>(null);

  const startQuiz = (moduleKey: string) => {
    hapticTap();
    setActiveModule(moduleKey);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setShowCertificate(false);
  };

  const handleSpeak = async (text: string, id: number) => {
    hapticTap();
    setIsTtsActive(id);
    try {
      await speakText(text);
    } catch {
      console.warn("Speech synthesis failed");
    } finally {
      setIsTtsActive(null);
    }
  };

  const currentQuestions = activeModule ? QUIZ_MODULES[activeModule].questions : [];
  const currentQ = currentQuestions[currentIdx];

  const selectOption = (optIdx: number) => {
    if (isAnswered) return;
    hapticTap();
    setSelectedOpt(optIdx);
  };

  const submitAnswer = () => {
    if (selectedOpt === null || isAnswered) return;
    setIsAnswered(true);
    const isCorrect = selectedOpt === currentQ.correctIndex;
    if (isCorrect) {
      hapticSuccess();
      setScore(prev => prev + 1);
    } else {
      hapticWarning();
    }
  };

  const handleNext = () => {
    hapticTap();
    if (currentIdx + 1 < currentQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const displayPercent = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    hapticTap();
    const txt = `Habari! I scoring ${displayPercent}% on SautiSahihi’s ${QUIZ_MODULES[activeModule || 'constitution'].title} quiz! Try this interactive senior-friendly Kenyan civic quiz to earn your leadership credentials!`;
    const url = `https://wa.me/?text=${encodeURIComponent(txt)}`;
    window.open(url, '_blank');
  };

  if (!activeModule) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#fafaf8] dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 space-y-4">
          <p className="text-xl font-bold italic text-[#135bec] dark:text-blue-400">
            "Play, learn, and test your civic knowledge. Get scores and certificates in Swahili, English or regional languages!"
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {Object.entries(QUIZ_MODULES).map(([key, mod]) => {
            const icons: Record<string, string> = {
              gavel: 'gavel',
              psychology: 'psychology',
              campaign: 'campaign'
            };
            return (
              <div key={key} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-between gap-6 hover:shadow-2xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl text-[#135bec] dark:text-blue-400">
                    <span className="material-symbols-outlined text-4xl filled">{icons[mod.icon] || 'quiz'}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{mod.title}</h3>
                    <p className="text-base text-gray-500 font-bold">{mod.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => startQuiz(key)}
                  className="w-full bg-[#135bec] hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] text-xl border-b-4 border-blue-900 active:scale-95 transition-all text-center"
                >
                  Start Quiz
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-8 text-center border-4 border-[#135bec]/10">
          <div className="size-24 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner text-5xl">
            🏆
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic">Quiz Completed!</h2>
            <p className="text-xl text-gray-500 font-black">Well done! You have completed the challenge.</p>
          </div>

          <div className="inline-block p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs uppercase tracking-widest text-[#135bec] font-black">Your Score Summary</p>
            <p className="text-6xl font-black text-[#135bec] mt-1 pr-1">{score} / {currentQuestions.length}</p>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400 mt-1">Accuracy: {displayPercent}%</p>
          </div>

          <p className="text-lg text-slate-500 font-bold px-4 max-w-md mx-auto">
            {displayPercent >= 70 
              ? "Wonderful job! You've demonstrated excellent civic understanding. Enter your name below to generate your official championship certificate!" 
              : "Keep studying! Review our Civic Academy articles to score higher and secure your SautiSahihi badge."}
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            <label className="block text-left text-xs font-black uppercase tracking-widest text-slate-400">Electors Certificate Name</label>
            <input 
              type="text" 
              placeholder="e.g. Kevin Jonathan" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-bold dark:text-white outline-none focus:border-[#135bec]"
            />
            <button 
              disabled={!userName.trim()}
              onClick={() => { hapticTap(); setShowCertificate(true); }}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl border-b-4 border-amber-900 active:scale-95 transition-all text-xl"
            >
              Generate Civic Certificate
            </button>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto">
            <button onClick={() => setActiveModule(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white py-4 rounded-2xl font-black text-sm uppercase">
              Exit Hub
            </button>
            <button onClick={() => startQuiz(activeModule)} className="flex-1 bg-blue-50 text-[#135bec] py-4 rounded-2xl font-black text-sm uppercase">
              Retry Quiz
            </button>
          </div>
        </div>

        {showCertificate && userName.trim() && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[3.5rem] border-4 border-amber-400 shadow-2xl relative space-y-6 overflow-hidden max-w-md mx-auto animate-in slide-in-from-bottom-8">
            <div id="print-certificate" className="relative p-8 border-4 border-double border-amber-300 dark:border-amber-600 rounded-[2.5rem] bg-amber-50/20 dark:bg-slate-900/40 text-center space-y-6">
              {/* Outer classic certificate lines */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-amber-300/30 rounded-3xl pointer-events-none" />
              
              <div className="text-amber-500 text-6xl mx-auto font-serif">🎖️</div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#135bec]">Republic of Kenya</span>
                <h3 className="text-xl font-serif font-black tracking-wide text-slate-900 dark:text-white">CONSTITUTIONAL LEADERSHIP</h3>
                <span className="text-xs font-bold text-gray-400 italic">SautiSahihi Civic Education Initiative</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Presented to</p>
                <p className="text-3xl font-serif font-black underline text-[#135bec] uppercase decoration-amber-500 decoration-double break-all">
                  {userName}
                </p>
              </div>

              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 max-w-[280px] mx-auto leading-relaxed">
                For successfully completing the comprehensive <strong className="font-black text-slate-900 dark:text-white italic">"{QUIZ_MODULES[activeModule].title}"</strong> evaluation with an accuracy of <strong className="text-lg text-emerald-600 font-black">{displayPercent}%</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-amber-200/40 text-[9px] font-black tracking-wide uppercase text-slate-400">
                <div className="space-y-1">
                  <div className="h-0.5 bg-slate-300 w-20 mx-auto" />
                  <p>SautiSahihi Board</p>
                </div>
                <div className="space-y-1">
                  <div className="h-0.5 bg-slate-300 w-20 mx-auto" />
                  <p>IEBC Verification Desk</p>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-400 italic">
                ID: SS-26-{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handlePrint}
                className="bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Print/PDF
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className="bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm uppercase"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                Share WA
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      
      {/* Header controls */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
        <div>
          <button 
            onClick={() => { hapticTap(); setActiveModule(null); }}
            className="flex items-center gap-2 text-[#135bec] font-black text-sm uppercase"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quit Quiz
          </button>
          <p className="text-xl font-black mt-1 text-slate-900 dark:text-white uppercase tracking-tight">
            {QUIZ_MODULES[activeModule].title}
          </p>
        </div>

        <button 
          onClick={() => handleSpeak(`${currentQ.question}. Options: ${currentQ.options.join(". ")}`, currentQ.id)}
          className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isTtsActive === currentQ.id ? 'bg-red-600 text-white' : 'bg-blue-50 text-[#135bec]'}`}
        >
          <span className="material-symbols-outlined text-2xl">{isTtsActive === currentQ.id ? 'stop' : 'volume_up'}</span>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase text-slate-400">
          <span>Question {currentIdx + 1} of {currentQuestions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#135bec] transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50">
        <h3 className="text-2xl font-bold font-sans text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4">
        {currentQ.options.map((option, idx) => {
          let optionClass = "bg-[#fafaf8] dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white";
          
          if (selectedOpt === idx) {
            optionClass = "bg-blue-50 dark:bg-blue-950/45 border-[#135bec] text-[#135bec] dark:text-blue-400 font-bold scale-[1.01] ring-2 ring-[#135bec]/25";
          }

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              optionClass = "bg-emerald-50 dark:bg-emerald-950/45 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-400/20";
            } else if (selectedOpt === idx) {
              optionClass = "bg-rose-50 dark:bg-rose-950/45 border-rose-500 text-rose-700 dark:text-rose-400 font-bold ring-2 ring-rose-400/20";
            } else {
              optionClass = "bg-gray-100/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-400 line-through";
            }
          }

          return (
            <button 
              key={idx}
              disabled={isAnswered}
              onClick={() => selectOption(idx)}
              className={`w-full p-6 rounded-2xl border-2 text-left text-xl transition-all font-bold active:scale-[0.99] flex items-center gap-4 ${optionClass}`}
            >
              <div className="size-8 rounded-full border-2 border-inherit flex items-center justify-center text-xs font-black uppercase shrink-0">
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="leading-snug break-words">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Action / Explanation Box */}
      {!isAnswered ? (
        <button 
          disabled={selectedOpt === null}
          onClick={submitAnswer}
          className="w-full bg-[#135bec] hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-[2rem] text-xl border-b-4 border-blue-900 active:scale-95 transition-all text-center"
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/55 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-2xl ${selectedOpt === currentQ.correctIndex ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedOpt === currentQ.correctIndex ? 'check_circle' : 'cancel'}
              </span>
              <span className={`text-xs font-black uppercase tracking-widest ${selectedOpt === currentQ.correctIndex ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedOpt === currentQ.correctIndex ? 'Correct Solution' : 'Incorrect Answer'}
              </span>
            </div>
            
            <p className="text-lg leading-relaxed font-bold text-gray-700 dark:text-gray-300">
              {currentQ.explanation}
            </p>

            <button 
              onClick={() => { hapticTap(); speakText(currentQ.explanation); }}
              className="flex items-center gap-2 text-xs font-black uppercase text-[#135bec] pt-2"
            >
              <span className="material-symbols-outlined text-sm">volume_up</span>
              Explain Aloud
            </button>
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-[#135bec] text-white font-black py-5 rounded-[2rem] text-xl border-b-4 border-blue-900 active:scale-95 transition-all text-center flex items-center justify-center gap-3"
          >
            {currentIdx + 1 === currentQuestions.length ? "Finish Quiz & See Results" : "Next Question"}
            <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
        </div>
      )}

    </div>
  );
};
