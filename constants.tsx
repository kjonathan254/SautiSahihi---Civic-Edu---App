import { TranslationSet, AppLanguage, IEBCOffice, LearnTopic } from './types.ts';

export const COLORS = {
  primary: '#135bec',
  secondary: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  accent: '#F59E0B',
};

export const VOTERS_CHARTER = {
  article: "Article 38",
  title: "Political Rights",
  content: "Every citizen has the right to free, fair and regular elections based on universal suffrage and the free expression of the will of the electors.",
  source: "Constitution of Kenya (2010)"
};

export const IEBC_HQ_INFO = {
  name: "IEBC Headquarters",
  address: "Anniversary Towers, 6th Floor, University Way, Nairobi",
  phone: "020-2877000",
  email: "info@iebc.or.ke",
  whatsapp: "0202877000",
  website: "https://www.iebc.or.ke"
};

export const ELECTION_MOODS = [
  { id: 'queue', label: 'The Patient Queue', icon: 'groups', prompt: "A hyper-realistic photograph of ONLY African/Kenyan citizens queuing peacefully at a Kenyan polling station." },
  { id: 'ink', label: 'The Purple Finger', icon: 'done_all', prompt: "A sharp close-up of a Kenyan elder's hand featuring a bright purple indelible ink stain." },
  { id: 'papers', label: 'The 6-Ballots', icon: 'style', prompt: "An artistic flat-lay of the 6 official Kenyan ballot papers of different colors." },
  { id: 'winner', label: 'Peaceful Victory', icon: 'celebration', prompt: "A joyful celebration in a vibrant Kenyan village square, waving small Kenyan flags." }
];

export const LEARN_TOPICS: LearnTopic[] = [
  { 
    id: 'rights-senior', 
    title: 'Your Rights as a Senior', 
    summary: 'Kenyan law provides special protections for elderly voters at the polls.', 
    detailedContent: 'Our Constitution honors our elders. On election day, you do not have to stand in long queues. You have the right to go straight to the front of the line. If your eyes are tired or your hands are shaky, you can choose a person you trust to help you mark the paper.',
    category: 'Rights', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=800",
    prompt: "A Kenyan guka being respectfully assisted by an IEBC official at a polling station." 
  },
  { 
    id: 'kiems-kit', 
    title: 'How the KIEMS Kit Works', 
    summary: 'Biometrics that don\'t need internet to identify you.', 
    detailedContent: 'Every kit is pre-loaded with an encrypted register for its specific polling station. When you place your finger on the sensor, the machine compares it against its internal memory—it does not need an internet connection to know who you are.',
    category: 'Technology', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800",
    prompt: "A modern KIEMS biometric identification device glowing in a Kenyan community hall." 
  },
  { 
    id: 'reg-2026', 
    title: 'Voter Registration 2026', 
    summary: 'Important dates for the continuous registration cycle.', 
    detailedContent: 'Voter registration is a continuous process in Kenya. The next major mass registration drive is expected in 2026. This is the time to ensure your details are up to date, or to register if you have moved to a new constituency.',
    category: 'Dates', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=800",
    prompt: "A calendar showing 2026 with the Kenya flag colors and a 'Register to Vote' stamp." 
  },
  { 
    id: 'how-to-reg', 
    title: 'How to Register', 
    summary: 'Simple steps to becoming a recognized voter.', 
    detailedContent: 'To register, visit any IEBC office in your constituency. Present your original National Identity Card or valid Passport. The officer will record your biometrics, including fingerprints and a photo.',
    category: 'Process', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800",
    prompt: "A smiling Kenyan elder holding their original ID card at a desk with an IEBC official." 
  },
  { 
    id: 'verify-status', 
    title: 'Verify Your Status', 
    summary: 'Check if you are correctly listed in the register.', 
    detailedContent: 'It is vital to check your registration status before any election. You can do this by sending your ID number via SMS to the official IEBC code, or by visiting the IEBC website.',
    category: 'Verification', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800",
    prompt: "A senior woman looking at her mobile phone with a look of relief and satisfaction." 
  },
  { 
    id: 'six-ballots', 
    title: 'The 6-Ballot System', 
    summary: 'Understanding the different colors of the voting papers.', 
    detailedContent: 'In a General Election, you will receive six different ballot papers. Each has a unique color: white for President, blue for Senate, yellow for Governor, green for Member of National Assembly, purple for Woman Representative, and beige for MCA.',
    category: 'Election Day', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1540910419892-f0c976c64663?q=80&w=800",
    prompt: "An artistic layout of six colorful Kenyan ballot papers neatly arranged on a clean table." 
  },
  { 
    id: 'offenses', 
    title: 'Election Offenses', 
    summary: 'Know what is illegal to protect yourself and others.', 
    detailedContent: 'Election offenses carry heavy penalties. It is illegal to take a photo of your marked ballot paper. Bribery, or accepting money to vote, is a serious crime.',
    category: 'Safety', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800",
    prompt: "A 'No Photography' and 'No Bribery' sign outside a Kenyan polling station." 
  },
  { 
    id: 'checklist', 
    title: 'Polling Day Checklist', 
    summary: 'What to carry and what to expect on the big day.', 
    detailedContent: 'On election day, wake up early and have a good breakfast. Carry your original ID card or Passport. Remember, as a senior, you can go to the front of the queue.',
    category: 'Planning', 
    lastUpdated: 'Mar 2024',
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800",
    prompt: "A small kit containing a Kenyan ID, a water bottle, and a hat, ready for election day." 
  }
];

export const TRANSLATIONS: Record<AppLanguage, TranslationSet> = {
  ENG: { home: "Home", welcome: "Welcome", tagline: "Clarity • Dignity • Truth", connectBtn: "Connect", apiKeyDesc: "Access the Civic Knowledge Hub.", factChecker: "Fact Checker", poll: "Mock Poll", learn: "Learn", assistant: "Assistant", settings: "Settings", checkClaim: "Check", uploadImage: "Upload", verdict: "Verdict", explanation: "Explanation", sources: "Sources", shareWhatsApp: "Share", voteNow: "Vote", standing: "Standing", latestNews: "News", contactSupport: "Support", iebcLocator: "Locator", languageSelect: "Language" },
  KIS: { home: "Nyumbani", welcome: "Karibu", tagline: "Uwasilishaji • Hadhi • Ukweli", connectBtn: "Unganisha", apiKeyDesc: "Pata Elimu ya Uraia.", factChecker: "Kihakiki", poll: "Upigaji", learn: "Elimu", assistant: "Msaidizi", settings: "Mipangilio", checkClaim: "Hakiki", uploadImage: "Pakia", verdict: "Uamuzi", explanation: "Maelezo", sources: "Vyanzo", shareWhatsApp: "Shiriki", voteNow: "Piga Kura", standing: "Hali", latestNews: "Habari", contactSupport: "Msaada", iebcLocator: "Tafuta", languageSelect: "Lugha" },
  GIK: { home: "Mucii", welcome: "Uhoro", tagline: "Utaũri • Gitiyo • Uma", connectBtn: "Hota", apiKeyDesc: "AI Studio.", factChecker: "Guthuthuria", poll: "Gwithuranira", learn: "Kwiruta", assistant: "Muteithia", settings: "Mabange", checkClaim: "Thuthuria", uploadImage: "Oya", verdict: "Utuĩro", explanation: "Utaũri", sources: "Sources", shareWhatsApp: "Heana", voteNow: "Ikia Kura", standing: "Standing", latestNews: "Mohoro", contactSupport: "Uteithio", iebcLocator: "Ofisi", languageSelect: "Language" },
  DHO: { home: "Pacho", welcome: "Donji", tagline: "Lero • Duong' • Adiera", connectBtn: "Kudore", apiKeyDesc: "AI Studio.", factChecker: "Nono", poll: "Yiero", learn: "Puonjruok", assistant: "Jakony", settings: "Chenro", checkClaim: "Nono", uploadImage: "Ket picha", verdict: "Ng'ado", explanation: "Lero", sources: "Sources", shareWhatsApp: "Oraye", voteNow: "Yier", standing: "Chung", latestNews: "Wache matuch", contactSupport: "Kony", iebcLocator: "Ofis", languageSelect: "Yier dhok" },
  LUH: { home: "Enzu", welcome: "Mirembe", tagline: "Maelezo • Gitiyo • Tushili", connectBtn: "Ruma", apiKeyDesc: "AI Studio.", factChecker: "Londa", poll: "Kupaka", learn: "Khwiyega", assistant: "Omukonyi", settings: "Tsipangilio", checkClaim: "Londa", uploadImage: "Rira", verdict: "Isiamu", explanation: "Maelezo", sources: "Sources", shareWhatsApp: "Rumire", voteNow: "Kupaka", standing: "Standing", latestNews: "Mohoro", contactSupport: "Obukonyi", iebcLocator: "Ofisi", languageSelect: "Language" }
};

export const CIVIC_FAQS: Record<AppLanguage, { q: string, a: string }[]> = {
  ENG: [{ q: "How do I register?", a: "Visit your local IEBC constituency office with your ID." }],
  KIS: [{ q: "Ninawezaje kujiandikisha?", a: "Tembelea ofisi ya jimbo ya IEBC na kitambulisho chako." }],
  GIK: [], DHO: [], LUH: []
};

export const IEBC_OFFICES: IEBCOffice[] = [
  { county: "Mombasa", constituency: "Changamwe", location: "At Changamwe firestation", landmark: "Changamwe firestation", distance: "0 meters" },
  { county: "Mombasa", constituency: "Jomvu", location: "Mikindani Police Station", landmark: "Mikindani Police Station", distance: "0 meters" },
  { county: "Mombasa", constituency: "Kisauni", location: "Bamburi Fisheries, Shangaza Estate House 9", landmark: "Supa Loaf Bakery", distance: "50 meters" },
  { county: "Mombasa", constituency: "Nyali", location: "Chiefs office Kongowea", landmark: "DCC Nyali's office", distance: "0 meters" },
  { county: "Mombasa", constituency: "Likoni", location: "Shika Adabu", landmark: "Shika Adabu Chiefs office", distance: "10 meters" },
  { county: "Mombasa", constituency: "Mvita", location: "Kizingo, Rashid Sajad road", landmark: "Chef Royale Restaurant", distance: "20 meters" },
  { county: "Nairobi", constituency: "Westlands", location: "DC Compound", landmark: "Safaricom Centre", distance: "200 Metres" },
  { county: "Nairobi", constituency: "Dagoretti North", location: "Maliposa Appartments - Ngong Road", landmark: "Nakumatt Junction", distance: "4KMs" },
  { county: "Nairobi", constituency: "Dagoretti South", location: "Maisha Poa Centre", landmark: "DCC Office Dagoretti South", distance: "200 Metres" },
  { county: "Nairobi", constituency: "Langata", location: "Langata Subcounty Headquarters", landmark: "Five Star Road", distance: "2KMs" },
  { county: "Nairobi", constituency: "Kibra", location: "Kibra DC", landmark: "Adjacent To Huduma Centre", distance: "0 Metres" },
  { county: "Nairobi", constituency: "Roysambu", location: "Kahawa West Acc's Office/Police Station", landmark: "Acc Office/Police Station", distance: "0 Metres" },
  { county: "Nairobi", constituency: "Kasarani", location: "Former DCC Offices", landmark: "Chiefs Office Nearby", distance: "700 Metres" },
  { county: "Nairobi", constituency: "Ruaraka", location: "Matigari General Merchants", landmark: "Lexx Place Hotel", distance: "450 Metres" },
  { county: "Nairobi", constituency: "Embakasi South", location: "Villa Franca", landmark: "Equity Afya Hospital Banner", distance: "0 Metres" },
  { county: "Nairobi", constituency: "Embakasi North", location: "Near DCC Office", landmark: "DCC Office", distance: "100 Meters" },
  { county: "Nairobi", constituency: "Embakasi Central", location: "DO's Office Kayole", landmark: "DO's Office Kayole", distance: "0 Metres" },
  { county: "Nairobi", constituency: "Embakasi East", location: "East Africa School of Aviation", landmark: "East Africa School of Aviation (EASA)", distance: "0 Metres" },
  { county: "Nairobi", constituency: "Embakasi West", location: "Tena White House Foot Bridge", landmark: "Next to Shell Petrol Station", distance: "10 Metres" },
  { county: "Nairobi", constituency: "Makadara", location: "Makadara DCC Compound", landmark: "CIPU Office Makadara", distance: "0 KMs" },
  { county: "Nairobi", constituency: "Kamukunji", location: "At DCC Hq Kamukunji", landmark: "DCC Office", distance: "0 KMs" },
  { county: "Nairobi", constituency: "Starehe", location: "Kenya Railways Block D", landmark: "Technical University of Kenya", distance: "200 Metres" },
  { county: "Nairobi", constituency: "Mathare", location: "Mathare DCC Compound", landmark: "DCC Office", distance: "0 Metres" }
];