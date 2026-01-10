import { TranslationSet, AppLanguage, IEBCOffice, LearnTopic } from './types.ts';

export const COLORS = {
  primary: '#135bec',
  secondary: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  accent: '#F59E0B',
};

// The Voter's Charter: Absolute Legal Truth (Replacement for unverified stats)
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
    detailedContent: 'Our Constitution honors our elders. On election day, you do not have to stand in long queues. You have the right to go straight to the front of the line. If your eyes are tired or your hands are shaky, you can choose a person you trust to help you mark the paper. The presiding officer is also there to ensure you vote in dignity and privacy.',
    category: 'Rights', 
    lastUpdated: 'Mar 2024',
    prompt: "A Kenyan guka being respectfully assisted by an IEBC official at a polling station." 
  },
  { 
    id: 'kiems-kit', 
    title: 'How the KIEMS Kit Works', 
    summary: 'Biometrics that don\'t need internet to identify you.', 
    detailedContent: 'Every kit is pre-loaded with an encrypted register for its specific polling station. When you place your finger on the sensor, the machine compares it against its internal memory—it does not need an internet connection to know who you are.',
    category: 'Technology', 
    lastUpdated: 'Mar 2024',
    prompt: "A modern KIEMS biometric identification device glowing in a Kenyan community hall." 
  },
  { 
    id: 'reg-2026', 
    title: 'Voter Registration 2026', 
    summary: 'Important dates for the continuous registration cycle.', 
    detailedContent: 'Voter registration is a continuous process in Kenya. The next major mass registration drive is expected in 2026. This is the time to ensure your details are up to date, or to register if you have moved to a new constituency.',
    category: 'Dates', 
    lastUpdated: 'Mar 2024',
    prompt: "A calendar showing 2026 with the Kenya flag colors and a 'Register to Vote' stamp." 
  },
  { 
    id: 'how-to-reg', 
    title: 'How to Register', 
    summary: 'Simple steps to becoming a recognized voter.', 
    detailedContent: 'To register, visit any IEBC office in your constituency. Present your original National Identity Card or valid Passport. The officer will record your biometrics, including fingerprints and a photo. You only need your ID card to vote on the actual election day.',
    category: 'Process', 
    lastUpdated: 'Mar 2024',
    prompt: "A smiling Kenyan elder holding their original ID card at a desk with an IEBC official." 
  },
  { 
    id: 'verify-status', 
    title: 'Verify Your Status', 
    summary: 'Check if you are correctly listed in the register.', 
    detailedContent: 'It is vital to check your registration status before any election. You can do this by sending your ID number via SMS to the official IEBC code, or by visiting the IEBC website. If your name is missing or spelled wrong, the officers will help you fix it immediately.',
    category: 'Verification', 
    lastUpdated: 'Mar 2024',
    prompt: "A senior woman looking at her mobile phone with a look of relief and satisfaction." 
  },
  { 
    id: 'six-ballots', 
    title: 'The 6-Ballot System', 
    summary: 'Understanding the different colors of the voting papers.', 
    detailedContent: 'In a General Election, you will receive six different ballot papers. Each has a unique color: white for President, blue for Senate, yellow for Governor, green for Member of National Assembly, purple for Woman Representative, and beige for MCA.',
    category: 'Election Day', 
    lastUpdated: 'Mar 2024',
    prompt: "An artistic layout of six colorful Kenyan ballot papers neatly arranged on a clean table." 
  },
  { 
    id: 'offenses', 
    title: 'Election Offenses', 
    summary: 'Know what is illegal to protect yourself and others.', 
    detailedContent: 'Election offenses carry heavy penalties. It is illegal to take a photo of your marked ballot paper. It is also illegal to campaign or wear party colors within 400 meters of a polling station. Bribery, or accepting money to vote, is a serious crime.',
    category: 'Safety', 
    lastUpdated: 'Mar 2024',
    prompt: "A 'No Photography' and 'No Bribery' sign outside a Kenyan polling station." 
  },
  { 
    id: 'checklist', 
    title: 'Polling Day Checklist', 
    summary: 'What to carry and what to expect on the big day.', 
    detailedContent: 'On election day, wake up early and have a good breakfast. Carry your original ID card or Passport. Remember, as a senior, you can go to the front of the queue. Bring water and a small snack if needed, and bring your peaceful spirit.',
    category: 'Planning', 
    lastUpdated: 'Mar 2024',
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

/**
 * THE SAUTISAHIHI MASTER BLUEPRINT: COMPREHENSIVE IEBC PHYSICAL REGISTRY
 */
export const IEBC_OFFICES: IEBCOffice[] = [
  // MOMBASA COUNTY
  { county: "Mombasa", constituency: "Changamwe", location: "At Changamwe firestation", landmark: "Changamwe firestation", distance: "0 meters" },
  { county: "Mombasa", constituency: "Jomvu", location: "Mikindani Police Station", landmark: "Mikindani Police Station", distance: "0 meters" },
  { county: "Mombasa", constituency: "Kisauni", location: "Bamburi Fisheries, Shangaza Estate House 9", landmark: "Supa Loaf Bakery", distance: "50 meters" },
  { county: "Mombasa", constituency: "Nyali", location: "Chiefs office Kongowea", landmark: "DCC Nyali's office", distance: "0 meters" },
  { county: "Mombasa", constituency: "Likoni", location: "Shika Adabu", landmark: "Shika Adabu Chiefs office", distance: "10 meters" },
  { county: "Mombasa", constituency: "Mvita", location: "Kizingo, Rashid Sajad road", landmark: "Chef Royale Restaurant", distance: "20 meters" },

  // KWALE COUNTY
  { county: "Kwale", constituency: "Msambweni", location: "Msambweni Dcc's Office Compound", landmark: "Subcounty Headquarters of Msambweni", distance: "100 Metres" },
  { county: "Kwale", constituency: "Lungalunga", location: "Mbuyuni Area Next to Rafiki Yetu Building", landmark: "Mnarani (Communication Mast)", distance: "100 Metres" },
  { county: "Kwale", constituency: "Matuga", location: "IEBC Offices, Kwale Town, Opposite Ministry of Information Offices", landmark: "Baraza Park, Kwale Town", distance: "200 Metres" },
  { county: "Kwale", constituency: "Kinango", location: "Bebora Plaza, 3rd Floor, Kinango Town", landmark: "Chief's Office Kinango Town", distance: "10 Metres" },

  // KILIFI COUNTY
  { county: "Kilifi", constituency: "Kilifi North", location: "Next To Huduma Centre Kilifi", landmark: "Kilifi Bridge", distance: "550 Metres" },
  { county: "Kilifi", constituency: "Kilifi South", location: "Majengo Kanamai", landmark: "Matatu Terminus - Majengo Kanamai", distance: "600 Metres" },
  { county: "Kilifi", constituency: "Kaloleni", location: "Adjacent To St.Johns Girls Sec. School", landmark: "Ack Church Kaloleni", distance: "50 Metres" },
  { county: "Kilifi", constituency: "Rabai", location: "Shikaadabu", landmark: "Cdf Office/Shikaadabu Dispensary", distance: "500 Metres" },
  { county: "Kilifi", constituency: "Ganze", location: "Ganze Town", landmark: "Ganze Sub-County Police Hq", distance: "0" },
  { county: "Kilifi", constituency: "Malindi", location: "Maweni Area - Near Judo", landmark: "Malindi Sub-County Hospital", distance: "600 Metres" },
  { county: "Kilifi", constituency: "Magarini", location: "Near Mwembe Resort", landmark: "Mwembe Resort", distance: "300 Metres" },

  // TANA RIVER COUNTY
  { county: "Tana River", constituency: "Garsen", location: "Garsen Town", landmark: "Kcb Bank", distance: "100 Metres" },
  { county: "Tana River", constituency: "Galole", location: "Hola Town", landmark: "Kenya Medical Training", distance: "50 Metres" },
  { county: "Tana River", constituency: "Bura", location: "Bura Town", landmark: "National Government Offices", distance: "0 Metres" },

  // LAMU COUNTY
  { county: "Lamu", constituency: "Lamu East", location: "Batuli Mudh-hir Haji Building - Faza", landmark: "Post Office - Faza", distance: "Adjacent" },
  { county: "Lamu", constituency: "Lamu West", location: "Ministry of Housing Office Building - Mokowe", landmark: "Public Work Office - Mokowe", distance: "100 Metres" },

  // TAITA TAVETA COUNTY
  { county: "Taita Taveta", constituency: "Taveta", location: "Next to Probation office Taveta", landmark: "Probation Office Taveta", distance: "5 Metres" },
  { county: "Taita Taveta", constituency: "Wundanyi", location: "Along Administration offices (DCC, County Govt)", landmark: "Next to Kenya Forest Service County office", distance: "50 Meters" },
  { county: "Taita Taveta", constituency: "Mwatate", location: "Mwatate old market, along Wundanyi road", landmark: "Tavevo water and sewerage company ltd", distance: "50 Meters" },
  { county: "Taita Taveta", constituency: "Voi", location: "Behind Taita Taveta County Public Service Board", landmark: "Voi Remand GK prison", distance: "100 Metres" },

  // GARISSA COUNTY
  { county: "Garissa", constituency: "Garissa Township", location: "Off Lamu Road, Behind Ministry Of Water Garage", landmark: "Ministry of Water Garage", distance: "N/A" },
  { county: "Garissa", constituency: "Balambala", location: "Balambala Town Next To Dc's Office", landmark: "Dc's Office", distance: "N/A" },
  { county: "Garissa", constituency: "Lagdera", location: "Modogashe Town, Opposite Police Station", landmark: "Police Station", distance: "N/A" },
  { county: "Garissa", constituency: "Dadaab", location: "Dadaab Town, Opposite Un Compound", landmark: "Un Compound", distance: "N/A" },
  { county: "Garissa", constituency: "Fafi", location: "Next To Dc's Office", landmark: "Dc's Office", distance: "N/A" },
  { county: "Garissa", constituency: "Ijara", location: "Masalani Town, Next To Dc's Office.", landmark: "Dc's Office", distance: "N/A" },

  // WAJIR COUNTY
  { county: "Wajir", constituency: "Wajir North", location: "Bute", landmark: "Police Station", distance: "100 Metres" },
  { county: "Wajir", constituency: "Wajir East", location: "Wajir", landmark: "Huduma Centre", distance: "20 Metres" },
  { county: "Wajir", constituency: "Tarbaj", location: "Tarbaj", landmark: "Ward Administrator's Office", distance: "50 Metres" },
  { county: "Wajir", constituency: "Wajir West", location: "Giriftu", landmark: "DCC's Office", distance: "100 Metres" },
  { county: "Wajir", constituency: "Eldas", location: "Eldas", landmark: "DC's Residence", distance: "50 Metres" },
  { county: "Wajir", constituency: "Wajir South", location: "Habaswein", landmark: "AP Camp", distance: "100 Metres" },

  // MANDERA COUNTY
  { county: "Mandera", constituency: "Banissa", location: "Banissa Town, Along Banissa-Rhamu Road", landmark: "Next to Malkamari Hotel", distance: "20 Meters" },
  { county: "Mandera", constituency: "Mandera West", location: "Opposite Takaba Primary Main Gate", landmark: "Takaba Primary School", distance: "20 Meters" },
  { county: "Mandera", constituency: "Mandera North", location: "Inside Mandera North DCC's Compound", landmark: "DCC Compound-Mandera North", distance: "Within DCC Compound" },
  { county: "Mandera", constituency: "Mandera South", location: "Elwak CBD Along Elwak-Wajir Road", landmark: "Dido Petrol Station", distance: "30 Metres" },
  { county: "Mandera", constituency: "Mandera East", location: "Off Suftu Road Behind Blue Light Petrol Station", landmark: "Blue Light Petrol Station", distance: "50 Metres" },
  { county: "Mandera", constituency: "Lafey", location: "Lafey Town", landmark: "Next To Lafey Primary School", distance: "100 Metres" },

  // MARSABIT COUNTY
  { county: "Marsabit", constituency: "Moyale", location: "ACK Moyale", landmark: "St. Paul Training Center", distance: "Within the Compound" },
  { county: "Marsabit", constituency: "North Horr", location: "Nyota Self Help Group North Horr", landmark: "Adjacent to AP Camp", distance: "300 Metres" },
  { county: "Marsabit", constituency: "Saku", location: "ACK Saku Offices Building", landmark: "St. Peter Cathedral", distance: "Within The Compound" },
  { county: "Marsabit", constituency: "Laisamis", location: "DCC Office Laisamis", landmark: "DCC Office", distance: "DCC Compound" },

  // ISIOLO COUNTY
  { county: "Isiolo", constituency: "Isiolo North", location: "Isiolo Town", landmark: "Opposite Isiolo County Assembly", distance: "10 Metres" },
  { county: "Isiolo", constituency: "Isiolo South", location: "Garbatulla Town", landmark: "Garbatulla Catholic Mission", distance: "Within Compound" },

  // MERU COUNTY
  { county: "Meru", constituency: "Buuri", location: "Timau", landmark: "DCC Buuri West Office", distance: "Sharing Building" },
  { county: "Meru", constituency: "Igembe Central", location: "Kangeta", landmark: "DCC Office", distance: "100 Meters" },
  { county: "Meru", constituency: "Igembe North", location: "Laare", landmark: "Shell Petrol Station (Kajuko Centre)", distance: "500 Meters" },
  { county: "Meru", constituency: "Tigania West", location: "Kianjai Town", landmark: "Kianjai National Bank", distance: "100 Meters" },
  { county: "Meru", constituency: "Tigania East", location: "Muriri DCC Compound", landmark: "DCC Office", distance: "100 Metres" },
  { county: "Meru", constituency: "North Imenti", location: "Meru Town", landmark: "Meru Huduma Center", distance: "300 Meters" },
  { county: "Meru", constituency: "Igembe South", location: "Maua Town", landmark: "Maua Police Station", distance: "150 Meters" },
  { county: "Meru", constituency: "Central Imenti", location: "Gatimbi Market", landmark: "Equator Signpost", distance: "800 Meters" },
  { county: "Meru", constituency: "South Imenti", location: "Nkubu", landmark: "Consolata Hospital Nkubu", distance: "2km" },

  // THARAKA-NITHI COUNTY
  { county: "Tharaka-Nithi", constituency: "Maara", location: "DCC Compound, Kienganguru", landmark: "DCC Compound", distance: "100 Metres" },
  { county: "Tharaka-Nithi", constituency: "Chuka/Igambang'ombe", location: "Chuka Town, Sub County Office Compound", landmark: "Opposite Trans National Bank", distance: "200 Metres" },
  { county: "Tharaka-Nithi", constituency: "Tharaka", location: "Marimanti Town, DCC Compound", landmark: "DCC Offices", distance: "200 Metres" },

  // EMBU COUNTY
  { county: "Embu", constituency: "Manyatta", location: "Embu Town-Along Embu-Meru Highway", landmark: "Ack Embu Cathedral Church", distance: "25 Metres" },
  { county: "Embu", constituency: "Runyenjes", location: "Embu East DCC Bulding, 1st Floor", landmark: "DCC Offices, Embu East", distance: "10 Metres" },
  { county: "Embu", constituency: "Mbeere South", location: "Kiritiri Town", landmark: "DCC Offices - Mbeere East Subcounty", distance: "200 Metres" },
  { county: "Embu", constituency: "Mbeere North", location: "DCC Compound Mbeere North Subcounty", landmark: "DCC Offices", distance: "15 Metres" },

  // KITUI COUNTY
  { county: "Kitui", constituency: "Mwingi North", location: "Kyuso Town", landmark: "Behind Equity Bank", distance: "200 ft" },
  { county: "Kitui", constituency: "Mwingi West", location: "Migwani market - inside DCC Office Complex", landmark: "Baraza Park", distance: "30 Metres" },
  { county: "Kitui", constituency: "Mwingi Central", location: "Mwingi Town Opposite NCPB Mwingi Depot", landmark: "NCPB Mwingi Depot", distance: "5 Metres" },
  { county: "Kitui", constituency: "Kitui West", location: "Matinyani", landmark: "Matinyani DCC Offices", distance: "2 KMS" },
  { county: "Kitui", constituency: "Kitui Rural", location: "Kwa Vonza Town", landmark: "Kitui Rural CDF Building", distance: "0 Metres" },
  { county: "Kitui", constituency: "Kitui Central", location: "Along DCC - Kitui Hospital Road", landmark: "Kafoca Hotel", distance: "20 Metres" },
  { county: "Kitui", constituency: "Kitui East", location: "Zombe Town", landmark: "Zombe Police Station", distance: "10 Metres" },
  { county: "Kitui", constituency: "Kitui South", location: "Ikutha Town", landmark: "Opposite Registry Office", distance: "100 Metres" },

  // MACHAKOS COUNTY
  { county: "Machakos", constituency: "Masinga", location: "Masinga Town Opposite MULKAS petrol station", landmark: "MULKAS petrol station", distance: "N/A" },
  { county: "Machakos", constituency: "Yatta", location: "NCPB Compound - Kithimani, Yatta", landmark: "NCPB Compound", distance: "N/A" },
  { county: "Machakos", constituency: "Kangundo", location: "Ministry Of Works Bulding", landmark: "Kangundo General Hospital", distance: "N/A" },
  { county: "Machakos", constituency: "Matungulu", location: "Kangundo Junior School Within Tala Town", landmark: "Kangundo Junior School", distance: "N/A" },
  { county: "Machakos", constituency: "Kathiani", location: "DCCs Office block", landmark: "DCCs Office block", distance: "N/A" },
  { county: "Machakos", constituency: "Mavoko", location: "DCC Office Compound in Athi River", landmark: "DCC Office Compound", distance: "N/A" },
  { county: "Machakos", constituency: "Machakos Town", location: "IEBC County Offices compound, Mwatu wa Ngoma Street", landmark: "Dept of Education", distance: "N/A" },
  { county: "Machakos", constituency: "Mwala", location: "Makutano ya Mwala Shopping centre", landmark: "Makutano Police Patrol Base", distance: "N/A" },

  // MAKUENI COUNTY
  { county: "Makueni", constituency: "Mbooni", location: "Tawa Social Hall", landmark: "Tawa Law Courts", distance: "80 Metres" },
  { county: "Makueni", constituency: "Kilome", location: "Kwa DC (Malili)", landmark: "Konza City (Malili)", distance: "1 km" },
  { county: "Makueni", constituency: "Kaiti", location: "Mukuyuni Shopping Centre (CDF Compound)", landmark: "Mukuyuni Police Station", distance: "200 Metres" },
  { county: "Makueni", constituency: "Makueni", location: "Wote (Chief's Camp)", landmark: "Makueni Subcounty Hospital", distance: "100 Metres" },
  { county: "Makueni", constituency: "Kibwezi West", location: "Makindu Town", landmark: "DCCs Office", distance: "Same compound" },
  { county: "Makueni", constituency: "Kibwezi East", location: "Kambu Lutheran Church", landmark: "Kambu Sub County (Interior Office)", distance: "150 Metres" },

  // NYANDARUA COUNTY
  { county: "Nyandarua", constituency: "Kinangop", location: "Elacy Trading Center First Floor", landmark: "North Kinangop Subcounty HQ", distance: "50 Meters" },
  { county: "Nyandarua", constituency: "Kipipiri", location: "Kipipiri Subcounty Headquaters", landmark: "Kipipiri Subcounty Headquaters", distance: "Within" },
  { county: "Nyandarua", constituency: "Ol Kalou", location: "IEBC County Headqauters", landmark: "Posta Building Olkalou", distance: "Within" },
  { county: "Nyandarua", constituency: "Ol Jorok", location: "Nyandarua West Subcounty Headquaters", landmark: "Nyandarua West Subcounty Headquaters", distance: "Within" },
  { county: "Nyandarua", constituency: "Ndaragwa", location: "Ndaragwa Township", landmark: "Ndaragwa Police Station", distance: "50 to 100 Meters" },

  // NYERI COUNTY
  { county: "Nyeri", constituency: "Tetu", location: "Tetu Sub County Headquarters Wamagana", landmark: "DCC Offices / NGCDF Offices", distance: "50 Meters" },
  { county: "Nyeri", constituency: "Kieni", location: "Mweiga Town", landmark: "Next To Equity Atm", distance: "1 Meter" },
  { county: "Nyeri", constituency: "Mathira", location: "2nd Floor Room 18, Mathira East DCC Complex", landmark: "Karatina Law Courts", distance: "Opposite" },
  { county: "Nyeri", constituency: "Othaya", location: "DCC Offices Grounds", landmark: "DCC Office", distance: "Within DCC Offices" },
  { county: "Nyeri", constituency: "Mukurwe-Ini", location: "Mukurwe-ini DCC Grounds Offices", landmark: "Mukurwe-ini sub county hospital", distance: "200 Meters" },
  { county: "Nyeri", constituency: "Nyeri-Town", location: "DCC Offices Grounds", landmark: "Huduma Center", distance: "50 Meters" },

  // KIRINYAGA COUNTY
  { county: "Kirinyaga", constituency: "Mwea", location: "County Council Offices Wanguru", landmark: "Wanguru Police Station", distance: "50 Metres" },
  { county: "Kirinyaga", constituency: "Gichugu", location: "All Saints Kianyaga ACK", landmark: "Raimu Primary School", distance: "50 Metres" },
  { county: "Kirinyaga", constituency: "Ndia", location: "Baricho Town", landmark: "A.C.K St Philips - Baricho", distance: "0.5metres" },
  { county: "Kirinyaga", constituency: "Kirinyaga Central", location: "Kerugoya Municipal Council Offices", landmark: "Kerugoya Police Station", distance: "50 Metres" },
  { county: "Kirinyaga", constituency: "County Office", location: "Professional Plaza 3rd Floor", landmark: "Judiciary Kerugoya High Court", distance: "50 Metres" },

  // MURANG'A COUNTY
  { county: "Murang'a", constituency: "Kangema", location: "Kangema Town", landmark: "DCC's offices", distance: "Within" },
  { county: "Murang'a", constituency: "Mathioya", location: "Kiria-Ini Town", landmark: "DCC's offices", distance: "Within" },
  { county: "Murang'a", constituency: "Kiharu", location: "Murang'a - Mukuyu", landmark: "Rubis Petrol Station at Mukuyu", distance: "100 Meters" },
  { county: "Murang'a", constituency: "Kigumo", location: "Kangari Town, East End Mall, 3rd Floor", landmark: "Muungano Microfinance", distance: "Within building" },
  { county: "Murang'a", constituency: "Maragwa", location: "Makuyu", landmark: "World Vision Block / ACC's Office", distance: "20 Meters" },
  { county: "Murang'a", constituency: "Kandara", location: "Kandara Town, Hurukai House, 2nd Floor", landmark: "Amica Sacco", distance: "500 Meters" },
  { county: "Murang'a", constituency: "Gatanga", location: "Kirwara Town, Next to Amica Sacco Building", landmark: "Opposite Kirwara Police Station", distance: "20 Meters" },

  // KIAMBU COUNTY
  { county: "Kiambu", constituency: "Gatundu South", location: "DCC Compound", landmark: "Gatundu Level 5 Hospital", distance: "100 Meters" },
  { county: "Kiambu", constituency: "Gatundu North", location: "Kamwangi", landmark: "DCC Office Kamwangi", distance: "Within Compound" },
  { county: "Kiambu", constituency: "Juja", location: "Menja Vision Plaza", landmark: "Behind Agakhan Hospital", distance: "30 Metres" },
  { county: "Kiambu", constituency: "Thika Town", location: "Afc Building Thika", landmark: "Buffalo Grill & Butchery", distance: "100 Metres" },
  { county: "Kiambu", constituency: "Ruiru", location: "Ruiru Law Courts", landmark: "Ruiru Law Courts", distance: "20 Meters" },
  { county: "Kiambu", constituency: "Githunguri", location: "DCC Compound", landmark: "DCC Offices", distance: "7 Metres" },
  { county: "Kiambu", constituency: "Kiambu", location: "Mapa House 4th Floor", landmark: "National Bank", distance: "10 Metres" },
  { county: "Kiambu", constituency: "Kiambaa", location: "Kiambaa Subcounty DCC Office Compoud", landmark: "DCC Building (Orange)", distance: "Afew Metres" },
  { county: "Kiambu", constituency: "Kabete", location: "Kabete Sub County Government Premises", landmark: "Wangige Sub County Hospital", distance: "100 Metres" },
  { county: "Kiambu", constituency: "Kikuyu", location: "Kikuyu Town", landmark: "K-Unity Bank", distance: "Zero" },
  { county: "Kiambu", constituency: "Limuru", location: "Directorate Of Public Works-Limuru", landmark: "Limuru Law Courts", distance: "200 Metres" },
  { county: "Kiambu", constituency: "Lari", location: "Kimende Town At K-Unity Sacco Bulding", landmark: "Kimende Town", distance: "Within" },

  // TURKANA COUNTY
  { county: "Turkana", constituency: "Turkana North", location: "Compound Lokitaung DCC's", landmark: "DCC's Office", distance: "10 Metres" },
  { county: "Turkana", constituency: "Turkana West", location: "Old DCC's Office Kakuma", landmark: "Refugees Affairs Services Offices", distance: "5 Metres" },
  { county: "Turkana", constituency: "Turkana Central", location: "DCC's Compound Lodwar", landmark: "Huduma Centre", distance: "10 Metres" },
  { county: "Turkana", constituency: "Loima", location: "DCC's Compound Lorgum", landmark: "DCC's Office", distance: "10 Metres" },
  { county: "Turkana", constituency: "Turkana South", location: "DCC's Compound Lokichar", landmark: "DCC's Office", distance: "5 Metres" },
  { county: "Turkana", constituency: "Turkana East", location: "DCC's Compound Lokori", landmark: "DCC's Office", distance: "5 metres" },

  // WEST POKOT COUNTY
  { county: "West Pokot", constituency: "Kapenguria", location: "Deputy Commissioner’s Compound", landmark: "DCC Offices", distance: "10 Meters" },
  { county: "West Pokot", constituency: "Sigor", location: "KVDA", landmark: "KVDA Offices", distance: "0 Metres" },
  { county: "West Pokot", constituency: "Kacheliba", location: "Holy Cross Catholic Church Kacheliba", landmark: "Kacheliba Catholic Church", distance: "100 Meters" },
  { county: "West Pokot", constituency: "Pokot South", location: "St Marks Development Centre", landmark: "DCC Offices", distance: "200 Meters" },

  // SAMBURU COUNTY
  { county: "Samburu", constituency: "Samburu West", location: "Maralal Town", landmark: "Samburu County Assembly", distance: "200 Metres" },
  { county: "Samburu", constituency: "Samburu North", location: "Baragoi Town DCC Office", landmark: "Within the DCC Building", distance: "0 Metres" },
  { county: "Samburu", constituency: "Samburu East", location: "Wambaa Town Wamba Parish", landmark: "Within the Church Compound", distance: "0 Metres" },

  // TRANS NZOIA COUNTY
  { county: "Trans Nzoia", constituency: "Kwanza", location: "KFA Building kitale town", landmark: "KFA Building", distance: "Within" },
  { county: "Trans Nzoia", constituency: "Endebess", location: "Endebess Centre", landmark: "DCCs office", distance: "150 Metres" },
  { county: "Trans Nzoia", constituency: "Saboti", location: "Maendeleo ya wanawake building Kitale", landmark: "Old Ambwere Plaza", distance: "100 Metres" },
  { county: "Trans Nzoia", constituency: "Kiminini", location: "Kiminini centre", landmark: "St Peters Cleavers Catholic Church", distance: "Within Compound" },
  { county: "Trans Nzoia", constituency: "Cherangany", location: "Kachibora", landmark: "DCCs office", distance: "Within DCCs Office" },

  // UASIN GISHU COUNTY
  { county: "Uasin Gishu", constituency: "Soy", location: "Meadows Plaza, opposite Sirikwa Hotel", landmark: "Meadows plaza", distance: "N/A" },
  { county: "Uasin Gishu", constituency: "Turbo", location: "Within NCCK North headquarters, West Indies", landmark: "NCCK North Headquarters", distance: "100 Metres" },
  { county: "Uasin Gishu", constituency: "Moiben", location: "Kimumu Ward Administrative Offices", landmark: "Kimumu Ward Administrative Offices", distance: "100 Metres" },
  { county: "Uasin Gishu", constituency: "Ainabkoi", location: "Adjacent To Eldoret East District Hqs", landmark: "District Hqs Across Road", distance: "0" },
  { county: "Uasin Gishu", constituency: "Kapseret", location: "Inside R.C.E.A Ushirika Church Compound", landmark: "R.C.E.A Ushirika Church", distance: "Inside" },
  { county: "Uasin Gishu", constituency: "Kesses", location: "Jamboni Complex Near DCC’s Office", landmark: "Moi Unversity Law School", distance: "1 Km" },

  // ELGEYO MARAKWET COUNTY
  { county: "Elgeyo Marakwet", constituency: "Marakwet East", location: "Chesoi DCC Compound", landmark: "DCC Office", distance: "Within" },
  { county: "Elgeyo Marakwet", constituency: "Marakwet West", location: "Kapsowar IEBC Office", landmark: "IEBC", distance: "Within" },
  { county: "Elgeyo Marakwet", constituency: "Keiyo North", location: "IEBC County", landmark: "Governor Office", distance: "Sharing a Fence" },
  { county: "Elgeyo Marakwet", constituency: "Keiyo South", location: "Chepkorio Prime Tower Sacco", landmark: "Prime Tower Sacco Society", distance: "Within" },

  // NANDI COUNTY
  { county: "Nandi", constituency: "Mosop", location: "Kabiyet-Nandi North District Headquarters", landmark: "Kabiyet-Nandi North District Headquarters", distance: "Same Compound" },
  { county: "Nandi", constituency: "Nandi Hills", location: "Nandi Hills Town, Ministry of Public Works", landmark: "Nandi Water Suplly", distance: "50 Meters" },
  { county: "Nandi", constituency: "Emgwen", location: "Mininstry of Lands Kapsabet", landmark: "Ministry of Lands/ Acc Office", distance: "20meters" },
  { county: "Nandi", constituency: "Chesumei", location: "Cheptarit Catholic Church- Mosoriot", landmark: "Cheptarit Catholic Church", distance: "Same Location" },
  { county: "Nandi", constituency: "Aldai", location: "St. Pauls Catholic Church, Kobujoi Town", landmark: "St. Pauls Catholic Church", distance: "N/A" },
  { county: "Nandi", constituency: "Tindiret", location: "Senetwo Social Hall", landmark: "Senetwo Primary School", distance: "Within" },

  // BARINGO COUNTY
  { county: "Baringo", constituency: "Tiaty", location: "Next To Ministry Of Education Chemolingot", landmark: "Chemolingot", distance: "N/A" },
  { county: "Baringo", constituency: "Baringo North", location: "Behind Posta Building", landmark: "Posta Building", distance: "19 Km From Kabarnet" },
  { county: "Baringo", constituency: "Baringo Central", location: "County Commissioners Premises", landmark: "Posta Building _ Kabarnet", distance: "100m" },
  { county: "Baringo", constituency: "Baringo South", location: "Deputy County Commissioner’s Compound", landmark: "District Hq Marigat", distance: "200m" },
  { county: "Baringo", constituency: "Mogotio", location: "Behind Boresha Sacco", landmark: "Boresha Sacco- Mogotio", distance: "70m" },
  { county: "Baringo", constituency: "Eldama Ravine", location: "Sub County Commissioner’s Compound", landmark: "Law Courts – Eldama Ravine", distance: "N/A" },

  // LAIΚΙΡΙΑ COUNTY
  { county: "Laikipia", constituency: "Laikipia West", location: "Telkom Building Nyahururu Town", landmark: "Nyahururu Law Courts", distance: "20 Metres" },
  { county: "Laikipia", constituency: "Laikipia East", location: "Laikipia County Commissioners Compound", landmark: "County Commissioners Office", distance: "Within" },
  { county: "Laikipia", constituency: "Laikipia North", location: "Doldol Catholic Parish Compound", landmark: "Doldol Catholic Church", distance: "Within" },

  // NAKURU COUNTY
  { county: "Nakuru", constituency: "Molo", location: "Dcc's Compound - Molo Town", landmark: "Dc's Office - Molo Town", distance: "200m" },
  { county: "Nakuru", constituency: "Njoro", location: "Aic Church - Compound -Njoro", landmark: "Aic Church - Njoro", distance: "Inside" },
  { county: "Nakuru", constituency: "Naivasha", location: "Dcc's Compound", landmark: "Naivasha Police Station", distance: "100m" },
  { county: "Nakuru", constituency: "Gilgil", location: "Hennsolex Building- Gilgil Town", landmark: "KPLC - Gilgil", distance: "Same Building" },
  { county: "Nakuru", constituency: "Kuresoi South", location: "Keringet centre- Keringet Mall", landmark: "Keringet Center", distance: "100m" },
  { county: "Nakuru", constituency: "Kuresoi North", location: "Sub County Offices, Kamara Division", landmark: "Sachoran Center", distance: "Inside" },
  { county: "Nakuru", constituency: "Subukia", location: "Behind top care hospital", landmark: "subukia-Nakuru highway", distance: "100m" },
  { county: "Nakuru", constituency: "Rongai", location: "Kampi ya moto behind DC office", landmark: "Kampi Ya Moto Trading Center", distance: "100m" },
  { county: "Nakuru", constituency: "Bahati", location: "Do's Compound - Kiamaina / Maili Sita", landmark: "Do's Office Kiamaina", distance: "100 M" },
  { county: "Nakuru", constituency: "Nakuru Town West", location: "County council offices", landmark: "Opposite KFA", distance: "200m" },
  { county: "Nakuru", constituency: "Nakuru Town East", location: "Catholic Diocese Nakuru (Cdn) Compound", landmark: "Mercy Mission Hospital", distance: "Within" },

  // NAROK COUNTY
  { county: "Narok", constituency: "Kilgoris", location: "Old Kilgoris County Council Offices", landmark: "Cooperative Bank Kilgoris", distance: "80 Metres" },
  { county: "Narok", constituency: "Emurua Dikkir", location: "Emurua Dikkir Sub County Offices", landmark: "Emurua Dikkir Sub County Offices", distance: "10 Metres" },
  { county: "Narok", constituency: "Narok North", location: "Narok North CDF Offices", landmark: "Narok County Commisioner Offices", distance: "20 Meters" },
  { county: "Narok", constituency: "Narok East", location: "Ntulele", landmark: "Ntulele Police Station", distance: "50 Metres" },
  { county: "Narok", constituency: "Narok South", location: "Ololulunga", landmark: "Ololulunga Police Station", distance: "10 Metres" },
  { county: "Narok", constituency: "Narok West", location: "Ngoswani Centre", landmark: "Drilled Water Solar Powerpoint", distance: "70 Metres" },

  // KAJIADO COUNTY
  { county: "Kajiado", constituency: "Kajiado North", location: "Ngong DCC Office", landmark: "Ngong DCC Office", distance: "0 Meters" },
  { county: "Kajiado", constituency: "Kajiado Central", location: "Ack Tenebo House", landmark: "Kajiado Total Petrol Station", distance: "50 Meters" },
  { county: "Kajiado", constituency: "Kajiado East", location: "Isinya Multi-Purpose", landmark: "Moi Girls High School Isinya", distance: "50 Meters" },
  { county: "Kajiado", constituency: "Kajiado West", location: "St Mary's Catholic Church-Kiserian", landmark: "St Mary's Catholic Church-Kiserian", distance: "0 Meters" },
  { county: "Kajiado", constituency: "Kajiado South", location: "County Government Revenue Office", landmark: "Loitoktok DCC Office", distance: "200 Meters" },

  // KERICHO COUNTY
  { county: "Kericho", constituency: "Ainamoi", location: "County Commissioner's Compound", landmark: "Administration Police", distance: "20 Meters" },
  { county: "Kericho", constituency: "Bureti", location: "Litein Town, Patnas Plaza", landmark: "Bureti Police Station", distance: "20 Meters" },
  { county: "Kericho", constituency: "Belgut", location: "Rev. Temuga Plaza", landmark: "Opposite DCC Office", distance: "100 Meters" },
  { county: "Kericho", constituency: "Sigowet Soin", location: "Soko Huru Center", landmark: "Mathioyo Stadium", distance: "800 Meters" },
  { county: "Kericho", constituency: "Kipkelion East", location: "Within Londian Post Office", landmark: "Londian Post Office", distance: "Inside" },
  { county: "Kericho", constituency: "Kipkelion West", location: "Posta Kenya Building Kipkelion", landmark: "Kipkellion Post Office", distance: "5 Meters" },

  // BOMET COUNTY
  { county: "Bomet", constituency: "Chepalungu", location: "Sigor AGC Church", landmark: "Junction to Sigor Township", distance: "500 Metres" },
  { county: "Bomet", constituency: "Bomet Central", location: "Bomet Town", landmark: "NCPB", distance: "0 Metres" },
  { county: "Bomet", constituency: "Konoin", location: "Mogogsiek DCC Office", landmark: "Konoin Subcounty", distance: "150 Metres" },
  { county: "Bomet", constituency: "Bomet East", location: "AFC Building, Bomet Town", landmark: "Shell Petrol Station", distance: "15 Metres" },
  { county: "Bomet", constituency: "Sotik", location: "Ministry of Agriculture", landmark: "Opposite CDF Office", distance: "20 Metres" },

  // KAKAMEGA COUNTY
  { county: "Kakamega", constituency: "Lugari", location: "Lumakanda Centre", landmark: "Lumakanda P.A.G. Church", distance: "95 Metres" },
  { county: "Kakamega", constituency: "Likuyani", location: "At PAG Kongoni Church Compound", landmark: "Likuyani Sub-County Offices", distance: "50 Metres" },
  { county: "Kakamega", constituency: "Malava", location: "Malava Friends Church Compound", landmark: "Malava Boys High School", distance: "50 Metres" },
  { county: "Kakamega", constituency: "Lurambi", location: "Post Office", landmark: "Huduma Center", distance: "20 Metres" },
  { county: "Kakamega", constituency: "Navakholo", location: "Opposite Dowa Filling Station", landmark: "Dowa Filling Station", distance: "30 Meters" },
  { county: "Kakamega", constituency: "Mumias West", location: "ACK Guest House", landmark: "ACK Church Complex", distance: "50 Metres" },
  { county: "Kakamega", constituency: "Mumias East", location: "Moco Buildings-Shianda", landmark: "Shianda Catholic Church", distance: "10 Metres" },
  { county: "Kakamega", constituency: "Matungu", location: "Matungu Market", landmark: "DCC", distance: "200 Metres" },
  { county: "Kakamega", constituency: "Butere", location: "Butere DCC Compound", landmark: "DCC Office", distance: "10 Metres" },
  { county: "Kakamega", constituency: "Khwisero", location: "Within DCC's Offices", landmark: "DCC's Office", distance: "Inside" },
  { county: "Kakamega", constituency: "Shinyalu", location: "Shinyalu Market", landmark: "St.Acquinas Teachers College", distance: "100 Metres" },
  { county: "Kakamega", constituency: "Ikolomani", location: "Sub-County Registrar of Persons Office", landmark: "Malinya Primary School", distance: "100 Metres" },

  // VIHIGA COUNTY
  { county: "Vihiga", constituency: "Vihiga", location: "Vihiga Educational Resource Centre", landmark: "Vihiga High School", distance: "500 Metres" },
  { county: "Vihiga", constituency: "Sabatia", location: "DCC Compound", landmark: "Sabatia Eye Hospital", distance: "600 Metres" },
  { county: "Vihiga", constituency: "Hamisi", location: "Hamisi Youth Empowerment Centre", landmark: "Hamisi Sub-County Hospital", distance: "100 Metres" },
  { county: "Vihiga", constituency: "Luanda", location: "Luanda Centre", landmark: "Bunyore Girls High School", distance: "800 Metres" },
  { county: "Vihiga", constituency: "Emuhaya", location: "Esibuye Centre", landmark: "Bunyore Medical Hospital", distance: "150 Metres" },

  // BUNGOMA COUNTY
  { county: "Bungoma", constituency: "Mt. Elgon", location: "Kapsokwony Koony House", landmark: "Within Kooni House", distance: "N/A" },
  { county: "Bungoma", constituency: "Sisiria", location: "DCC Compound", landmark: "Sirisia DCC Office", distance: "50 Metres" },
  { county: "Bungoma", constituency: "Kabuchai", location: "Behind Kabuchai Cdf Compound", landmark: "Chwele Market", distance: "100 Metres" },
  { county: "Bungoma", constituency: "Bumula", location: "Bumula DCC Ofiice", landmark: "DCC Compound", distance: "150 Metres" },
  { county: "Bungoma", constituency: "Kanduyi", location: "Bungoma Cereals Board Silos", landmark: "Next To Silos", distance: "N/A" },
  { county: "Bungoma", constituency: "Webuye East", location: "1st Office at DCC Compound", landmark: "DCC Compound / Mp Office", distance: "50m" },
  { county: "Bungoma", constituency: "Webuye West", location: "Matisi Market", landmark: "Webuye West CDF Offices", distance: "100 Metres" },
  { county: "Bungoma", constituency: "Kimilili", location: "Great Lounch Hotel Building", landmark: "Kimilili Deb Primary", distance: "20 Metres" },
  { county: "Bungoma", constituency: "Tongaren", location: "Within Bungoma North Sub-County Headquaters", landmark: "CDF Offices", distance: "50 Metres" },

  // BUSIA COUNTY
  { county: "Busia", constituency: "Teso North", location: "DCC's Compound", landmark: "Law Courts", distance: "2 Metres" },
  { county: "Busia", constituency: "Teso South", location: "DCC's Compound", landmark: "DCC's building", distance: "0 Metres" },
  { county: "Busia", constituency: "Nambale", location: "DCC's Compound", landmark: "DCC's building", distance: "0 Metres" },
  { county: "Busia", constituency: "Matayos", location: "Assistant County Commissioner's compound", landmark: "ACC office", distance: "10 Metres" },
  { county: "Busia", constituency: "Butula", location: "DCC's Compound", landmark: "Butula Police Station", distance: "30 Metres" },
  { county: "Busia", constituency: "Funyula", location: "Funyula market", landmark: "Moody Awori Primary school", distance: "20 Metres" },
  { county: "Busia", constituency: "Budalangi", location: "Budalangi Market", landmark: "Budalangi Primary School", distance: "100 Metres" },

  // SIAYA COUNTY
  { county: "Siaya", constituency: "Ugenya", location: "Ukwala - Opposite Sub County Officers", landmark: "Posta - Ukwala", distance: "100 Metres" },
  { county: "Siaya", constituency: "Ugunja", location: "Along Savana - Ambira Hospital Road", landmark: "Savana Hotel", distance: "50 Metres" },
  { county: "Siaya", constituency: "Alego Usonga", location: "Siaya Town- Within County Commissioner Compound", landmark: "County Commissioner's Office", distance: "100 Metres" },
  { county: "Siaya", constituency: "Gem", location: "Nyangweso Market Centre", landmark: "Sawagongo High School", distance: "200 Metres" },
  { county: "Siaya", constituency: "Bondo", location: "Adjacent Municipal Offices", landmark: "Bondo Law Courts", distance: "20 Metres" },
  { county: "Siaya", constituency: "Rarieda", location: "Kalandini Market Centre", landmark: "Kalandini Market", distance: "100 Metres" },

  // KISUMU COUNTY
  { county: "Kisumu", constituency: "Nyando", location: "Awasi DCC Compound", landmark: "Awasi DCC Compound", distance: "N/A" },
  { county: "Kisumu", constituency: "Muhoroni", location: "Awasi", landmark: "Pawtenge Primary", distance: "N/A" },
  { county: "Kisumu", constituency: "Nyakach", location: "Pap Onditi DCC Compound", landmark: "Pap Onditi DCC Compound", distance: "N/A" },
  { county: "Kisumu", constituency: "Seme", location: "Kombewa DCC Compound", landmark: "Kombewa DCC Compound", distance: "N/A" },
  { county: "Kisumu", constituency: "Kisumu West", location: "DCCs office block", landmark: "Huduma centre and CDF office", distance: "N/A" },
  { county: "Kisumu", constituency: "Kisumu East", location: "Mamboleo Show Ground", landmark: "Mamboleo Show Ground", distance: "N/A" },
  { county: "Kisumu", constituency: "Kisumu Central", location: "Huduma Centre Wing C Ground Floor", landmark: "Huduma Centre", distance: "N/A" },

  // HOMABAY COUNTY
  { county: "Homabay", constituency: "Kasipul", location: "Karachuonyo South DCC Compound at Kosele", landmark: "Karachuonyo South DCC", distance: "N/A" },
  { county: "Homabay", constituency: "Kabondo Kasipul", location: "At Kadongo Centre", landmark: "Kisii - Kisumu Road", distance: "N/A" },
  { county: "Homabay", constituency: "Karachuonyo", location: "Rachuonyo North DCC Complex at Kamodi", landmark: "Rachuonyo North DCC", distance: "N/A" },
  { county: "Homabay", constituency: "Rangwe", location: "New Rangwe DCC's Complex", landmark: "Rangwe DCC's Complex", distance: "N/A" },
  { county: "Homabay", constituency: "Homa Bay Town", location: "Behind CC's Complex", landmark: "CC's Complex", distance: "N/A" },
  { county: "Homabay", constituency: "Ndhiwa", location: "Ndhiwa Sub County DCC Complex", landmark: "Ndhiwa Sub County DCC", distance: "N/A" },
  { county: "Homabay", constituency: "Suba North", location: "Inside Suba North Sub County Compound", landmark: "Mbita - Rusinga Road", distance: "N/A" },
  { county: "Homabay", constituency: "Suba South", location: "At Magunga Trading Centre", landmark: "Magunga Trading Centre", distance: "N/A" },

  // MIGORI COUNTY
  { county: "Migori", constituency: "Rongo", location: "Rongo Town DCC Office", landmark: "Within DCC office compound", distance: "Within" },
  { county: "Migori", constituency: "Awendo", location: "Awendo Town NCPB", landmark: "Within NCPB Compound", distance: "Within" },
  { county: "Migori", constituency: "Suna East", location: "Migori Town", landmark: "Migori County IEBC Office", distance: "Wthin" },
  { county: "Migori", constituency: "Suna West", location: "Migori Town NCPB / Namba Junction", landmark: "NCPB Compound", distance: "N/A" },
  { county: "Migori", constituency: "Uriri", location: "Uriri Town DCC office", landmark: "Within DCC Compound", distance: "Within" },
  { county: "Migori", constituency: "Nyatike", location: "Macalda Town County Government Office", landmark: "DCC office", distance: "50m" },
  { county: "Migori", constituency: "Kuria West", location: "Kehancha Town", landmark: "Kehancha Law Courts", distance: "Next" },
  { county: "Migori", constituency: "Kuria East", location: "Kegonga Town DCC Office", landmark: "Within DCC's Office", distance: "Within" },

  // KISII COUNTY
  { county: "Kisii", constituency: "Bonchari", location: "Suneka Market", landmark: "Itierio Boys High School", distance: "40 Metres" },
  { county: "Kisii", constituency: "South Mugirango", location: "Nyamarambe", landmark: "DCC's Office", distance: "50 Metres" },
  { county: "Kisii", constituency: "Bomachoge Borabu", location: "Kenyanya Market Centre", landmark: "DCC's Office", distance: "10 Metres" },
  { county: "Kisii", constituency: "Bobasi", location: "Itumbe", landmark: "DCC's Office", distance: "50 Metres" },
  { county: "Kisii", constituency: "Bomachoge Chache", location: "Ogembo", landmark: "DCC's Office", distance: "20 Metres" },
  { county: "Kisii", constituency: "Nyaribari Masaba", location: "Masimba", landmark: "DCC's Office", distance: "40 Metres" },
  { county: "Kisii", constituency: "Nyaribari Chache", location: "Kisii town", landmark: "County Commissioner's Office", distance: "50 Metres" },
  { county: "Kisii", constituency: "Kitutu Chache North", location: "Marani Centre", landmark: "Marani Sub-County Office", distance: "100 Metres" },
  { county: "Kisii", constituency: "Kitutu Chache South", location: "Kisii town", landmark: "County Commissioner's Office", distance: "20 Metres" },

  // NYAMIRA COUNTY
  { county: "Nyamira", constituency: "Kitutu Masaba", location: "Manga DCC Compound", landmark: "Manga Cliff", distance: "200 Metres" },
  { county: "Nyamira", constituency: "West Mugirango", location: "Nyamira Town County Commissioners' Headquarters", landmark: "Nyamira Law Courts", distance: "200 Metres" },
  { county: "Nyamira", constituency: "North Mugirango", location: "Ekerenyo Market", landmark: "Ekerenyo Bus Stage", distance: "100 Metres" },
  { county: "Nyamira", constituency: "Borabu", location: "DCC Office Compound in Kijauri Town", landmark: "DCC Offfice", distance: "20 Metres" },

  // NAIROBI COUNTY
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
