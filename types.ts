
export interface UserProfile {
  id: string;
  name: string;
  age: number | null;
  bio: string;
  distance: number; // in km
  images: string[];
  tags: string[];
  currentTag?: string;
  rankingScore: number; // 0-10
  isPremium?: boolean;
  job?: string;
  // Detailed Profile Fields
  sign?: string;
  height?: string;
  education?: string;
  intention?: string;
  relationship?: string;
  classification?: string;
  billSplit?: string;
  availableToday?: boolean;
  family?: string;
  communication?: string;
  loveLanguage?: string;
  drink?: string;
  smoke?: string;
  pets?: string;
  exercise?: string;
  food?: string;
  sleep?: string;
  personality?: string[];
  lookingFor?: string[];
}

export interface MyProfile {
  name: string;
  birthDate: string;
  city: string;
  state: string;
  discoveryCity?: string;
  discoveryState?: string;
  gender: string;
  lookingFor: string[];
  images: string[];
  bio: string;
  rankingEnabled: boolean;
  loginMethod: 'email' | 'google' | 'facebook';
  relationship?: string;
  education?: string;
  family?: string;
  sign?: string;
  pets?: string;
  drink?: string;
  smoke?: string;
  exercise?: string;
  food?: string;
  sleep?: string;
  personality: string[];
  height?: string;
  currentTag?: string;
  classification?: string;
  billSplit?: string;
  availableToday?: boolean;
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  expandDistance: boolean;
  expandAge: boolean;
  internationalMode: boolean;
  profileVisible: boolean;
  hideAge: boolean;
  readReceiptsEnabled: boolean;
  allowMarketingEmails: boolean;
  // ... other details
}

export interface ChatPreview {
  id: string;
  userId: string;
  name: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  readReceiptsEnabled?: boolean;
  tags?: string[];
  images?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  readReceiptsEnabled?: boolean;
  variant?: 'icebreaker' | 'compliment';
}

export interface Payment {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'Pago' | 'Pendente' | 'Falha';
  cardLast4: string;
}

export interface ReportTicket {
  id: string;
  offenderName: string;
  date: string;
  reason: string;
  description: string;
  status: 'Pendente' | 'Em Análise' | 'Resolvido';
  updates: { 
    id: string;
    text: string; 
    sender: 'user' | 'support'; 
    timestamp: string;
  }[];
}

export enum AppScreen {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  RANKING = 'RANKING',
  LIKES = 'LIKES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  CHAT_DETAIL = 'CHAT_DETAIL',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  EDIT_PROFILE = 'EDIT_PROFILE',
  SETTINGS = 'SETTINGS',
  PREMIUM = 'PREMIUM',
  SECURITY = 'SECURITY',
  HELP = 'HELP',
  PAYMENT_HISTORY = 'PAYMENT_HISTORY',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  REPORT = 'REPORT',
  REPORT_LIST = 'REPORT_LIST',
  REPORT_DETAIL = 'REPORT_DETAIL',
  ABOUT = 'ABOUT',
  TERMS_SECURITY = 'TERMS_SECURITY',
  PRIVACY_SECURITY = 'PRIVACY_SECURITY',
  RULES = 'RULES',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export type MatchType = 'like' | 'superlike' | 'dislike' | 'neutral';

export interface NotificationItem {
  id: string;
  type: 'match' | 'message' | 'superlike' | 'system';
  title: string;
  description: string;
  timestamp: string;
  seen?: boolean;
  payload?: {
    screen?: string;
    actionLabel?: string;
    counterpartName?: string;
    offenderName?: string;
    plan?: string | null;
    source?: string;
  };
}
