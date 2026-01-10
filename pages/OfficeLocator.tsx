
import React, { useState, useMemo } from 'react';
import { AppLanguage, TranslationSet, IEBCOffice } from '../types.ts';
import { IEBC_OFFICES, IEBC_HQ_INFO } from '../constants.tsx';
import { hapticTap } from '../utils.ts';

interface Props {
  lang: AppLanguage;
  t: TranslationSet;
}

const OfficeLocator: React.FC<Props> = ({ lang, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All');

  const uniqueCounties = useMemo(() => {
    const counties = Array.from(new Set(IEBC_OFFICES.map(o => o.county)));
    return counties.sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredOffices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return IEBC_OFFICES.filter(o => {
      const matchesSearch = !q || 
        o.county.toLowerCase().includes(q) || 
        o.constituency.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.landmark.toLowerCase().includes(q);
      
      const matchesCounty = selectedCounty === 'All' || o.county === selectedCounty;
      
      return matchesSearch && matchesCounty;
    });
  }, [searchQuery, selectedCounty]);

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    hapticTap();
    setSelectedCounty(e.target.value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-[#135bec] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">{t.iebcLocator}</h2>
          <p className="text-xl opacity-90 font-bold italic leading-tight">Finding official physical locations across Kenya.</p>
        </div>
        <span className="absolute -right-6 -bottom-6 material-symbols-outlined text-[12rem] opacity-10 rotate-12">location_on</span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-3">
           <span className="material-symbols-outlined text-[#135bec] filled">travel_explore</span>
           <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Search for your Office</span>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              className="w-full px-8 py-6 bg-slate-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 rounded-[2.5rem] text-2xl font-black shadow-inner appearance-none outline-none focus:border-[#135bec] transition-all dark:text-white"
            >
              <option value="All">All 47 Counties</option>
              {uniqueCounties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
            <span className="absolute right-8 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#135bec] pointer-events-none text-4xl">arrow_drop_down</span>
          </div>

          <div className="relative group">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-4xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Constituency or Landmark..."
              className="w-full pl-20 pr-8 py-6 bg-slate-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 rounded-[2.5rem] text-2xl font-bold shadow-inner outline-none focus:border-[#135bec] transition-all dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-8">
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">
             Official Registry: {filteredOffices.length} Entries
           </p>
        </div>

        {filteredOffices.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredOffices.map((office, idx) => (
              <div 
                key={`${office.constituency}-${idx}`}
                className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-700 flex flex-col gap-6"
              >
                <div className="flex justify-between items-start border-b-2 border-slate-50 dark:border-slate-700 pb-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{office.county} County</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{office.constituency}</h3>
                  </div>
                  <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-lg">
                     <p className="text-lg font-black text-center">{office.distance}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-5">
                    <div className="size-14 bg-[#135bec]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#135bec] text-3xl">corporate_fare</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Office Location</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {office.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="size-14 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600 text-3xl">signpost</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Notable Landmark</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-tight italic">
                        {office.landmark}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <a 
                    href={`https://www.google.com/maps/search/IEBC+Office+${office.constituency}+${office.county}`} 
                    target="_blank" 
                    className="py-6 bg-slate-50 dark:bg-slate-700 rounded-3xl flex items-center justify-center gap-3 font-black text-[#135bec] active:scale-95 transition-transform border-2 border-transparent hover:border-blue-100"
                  >
                    <span className="material-symbols-outlined text-3xl">directions</span> 
                    SEE ON MAP
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-10 space-y-6 opacity-40">
            <span className="material-symbols-outlined text-[8rem]">location_off</span>
            <p className="text-2xl font-black uppercase tracking-tight">No Offices Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeLocator;
