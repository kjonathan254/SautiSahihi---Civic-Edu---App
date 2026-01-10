
export type AppLanguage = 'ENG' | 'KIS' | 'GIK' | 'DHO' | 'LUH';
export type Language = AppLanguage;

export enum AppScreen {
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  VERIFY_INPUT = 'VERIFY_INPUT',
  VERIFY_RESULT = 'VERIFY_RESULT',
  CHAT = 'CHAT',
  LEARN = 'LEARN',
  PROFILE = 'PROFILE',
  RESULTS = 'RESULTS',
  OFFICE_LOCATOR = 'OFFICE_LOCATOR'
}

export interface TranslationSet {
  home: string;
  welcome: string;
  tagline: string;
  connectBtn: string;
  apiKeyDesc: string;
  factChecker: string;
  poll: string;
  learn: string;
  assistant: string;
  settings: string;
  checkClaim: string;
  uploadImage: string;
  verdict: string;
  explanation: string;
  sources: string;
  shareWhatsApp: string;
  voteNow: string;
  standing: string;
  latestNews: string;
  contactSupport: string;
  iebcLocator: string;
  languageSelect: string;
}

export interface PollResult {
  coalitionA: number;
  movementB: number;
  allianceC: number;
}

export interface LearnTopic {
  id: string;
  title: string;
  summary: string;
  detailedContent: string;
  category: string;
  prompt: string;
  lastUpdated: string;
}

export interface IEBCOffice {
  county: string;
  constituency: string;
  location: string;
  landmark: string;
  distance: string;
}

export enum Verdict {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  CAUTION = 'CAUTION'
}

export interface FactCheckResult {
  verdict: Verdict;
  summary: string;
  explanation: string;
  sources: string[];
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingLinks?: GroundingLink[];
}

export interface VerificationResult {
  verdict: 'TRUE' | 'FALSE' | 'CAUTION' | string;
  explanation: string;
  source?: string;
  groundingLinks?: GroundingLink[];
}

export interface Briefing {
  title: string;
  summary: string;
}
