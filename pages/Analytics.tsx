import React, { useState, useEffect } from 'react';
import { AppLanguage, TranslationSet } from '../types.ts';
import { hapticTap } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const Analytics: React.FC<Props> = ({ lang, t }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [locationStats, setLocationStats] = useState<Record<string, number>>({});
  const [factChecks, setFactChecks] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqRes, locRes, factRes, adminRes] = await Promise.all([
        fetch('/api/faqs'),
        fetch('/api/locations/stats'),
        fetch('/api/fact-checks'),
        fetch('/api/admin/stats')
      ]);
      
      setFaqs(await faqRes.json());
      setLocationStats(await locRes.json());
      setFactChecks(await factRes.json());
      setAdminStats(await adminRes.json());
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadReport = () => {
    hapticTap();
    if (!adminStats) return;

    const report = `
SAUTISAHIHI - STAKEHOLDER IMPACT REPORT
Generated: ${new Date().toLocaleString()}
------------------------------------------

1. EXECUTIVE SUMMARY
Total AI Assistant Queries: ${adminStats.assistantQueries}
Total Practice Votes: ${adminStats.pollParticipation}
Total Fact Checks Performed: ${adminStats.totalFactChecks}
Total IEBC Office Locator Visits: ${adminStats.totalLocationVisits}

2. INCLUSIVITY & LANGUAGE ACCESS
${Object.entries(adminStats.languages).map(([lang, count]) => `- ${lang}: ${count} interactions`).join('\n')}

3. TOP CIVIC EDUCATION TOPICS (LEARN)
${Object.entries(adminStats.learnViews).map(([topic, count]) => `- ${topic}: ${count} views`).join('\n')}

4. TOP IEBC OFFICE SEARCHES
${Object.entries(locationStats).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([id, count]) => `- ${id}: ${count} visits`).join('\n')}

5. FREQUENTLY ASKED QUESTIONS
${faqs.map(f => `- ${f.question}: ${f.visits} visits`).join('\n')}

6. RECENT COMMUNITY FACT CHECKS
${factChecks.slice(0, 10).map(f => `[${f.verdict}] ${f.claim}`).join('\n')}

------------------------------------------
END OF REPORT
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SautiSahihi_Stakeholder_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="size-16 border-4 border-[#135bec] border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-black text-[#135bec] uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-5xl font-black mb-1 tracking-tighter uppercase italic">Admin Dashboard</h2>
        <p className="text-2xl opacity-80 font-bold italic text-blue-300">Backend Insights & Trends</p>
        <span className="absolute -right-10 -bottom-10 material-symbols-outlined text-[15rem] opacity-5 rotate-12">monitoring</span>
      </div>

      {adminStats && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-widest opacity-70">AI Queries</p>
            <p className="text-5xl font-black">{adminStats.assistantQueries}</p>
            <p className="text-xs font-bold mt-2 italic">Citizen engagement with AI</p>
          </div>
          <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-widest opacity-70">Practice Votes</p>
            <p className="text-5xl font-black">{adminStats.pollParticipation}</p>
            <p className="text-xs font-bold mt-2 italic">Voter readiness simulation</p>
          </div>
          <div className="bg-amber-600 p-8 rounded-[3rem] text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-widest opacity-70">Fact Checks</p>
            <p className="text-5xl font-black">{adminStats.totalFactChecks}</p>
            <p className="text-xs font-bold mt-2 italic">Rumors debunked by community</p>
          </div>
        </section>
      )}

      {adminStats && (
        <section className="bg-white dark:bg-slate-800 p-8 rounded-[3.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#135bec] text-4xl">language</span>
            <h3 className="text-3xl font-black tracking-tighter uppercase">Inclusivity (Language Use)</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(adminStats.languages).map(([lang, count]) => {
              const total = Object.values(adminStats.languages as Record<string, number>).reduce((a, b) => a + b, 0) || 1;
              const percent = Math.round(((count as number) / total) * 100);
              return (
                <div key={lang} className="space-y-2">
                  <div className="flex justify-between font-black uppercase text-xs tracking-widest">
                    <span>{lang}</span>
                    <span>{count as number} Users ({percent}%)</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#135bec] transition-all duration-1000" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <span className="material-symbols-outlined text-[#135bec] text-4xl">quiz</span>
          <h3 className="text-3xl font-black tracking-tighter uppercase">FAQ Engagement</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-50 dark:border-slate-700 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-xl font-black text-slate-800 dark:text-white">{faq.question}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question ID: {faq.id}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-[#135bec]">{faq.visits}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visits</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <span className="material-symbols-outlined text-emerald-600 text-4xl">location_on</span>
          <h3 className="text-3xl font-black tracking-tighter uppercase">Popular IEBC Offices</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(locationStats).length > 0 ? (
            Object.entries(locationStats).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([id, count]) => (
              <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{id.replace('-', ' - ')}</p>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-2xl">
                  <p className="text-2xl font-black text-emerald-600">{count}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 text-slate-400 font-bold italic">No location data recorded yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <span className="material-symbols-outlined text-amber-600 text-4xl">history</span>
          <h3 className="text-3xl font-black tracking-tighter uppercase">Fact Check History</h3>
        </div>
        <div className="space-y-4">
          {factChecks.length > 0 ? (
            factChecks.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-50 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-start">
                  <p className="text-xl font-black text-slate-800 dark:text-white italic">"{item.claim}"</p>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    item.verdict === 'TRUE' ? 'bg-emerald-100 text-emerald-700' :
                    item.verdict === 'FALSE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.verdict}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.explanation}
                </p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="px-4 text-slate-400 font-bold italic">No fact checks recorded yet.</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={downloadReport}
          className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          <span className="material-symbols-outlined text-4xl">download</span>
          DOWNLOAD REPORT
        </button>

        <button 
          onClick={() => { hapticTap(); fetchData(); }}
          className="w-full py-8 bg-[#135bec] text-white rounded-[2.5rem] font-black text-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          <span className="material-symbols-outlined text-4xl">refresh</span>
          REFRESH DATA
        </button>
      </div>
    </div>
  );
};

export default Analytics;
