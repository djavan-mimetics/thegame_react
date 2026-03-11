import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MyProfile } from './types';

const PROFILE_CACHE_KEY = 'thegame_profile_cache';
const PREMIUM_CACHE_KEY = 'thegame_is_premium';

const DEFAULT_PROFILE: MyProfile = {
  name: 'Lucas',
  birthDate: '15/06/1996',
  city: 'Rio de Janeiro',
  state: 'RJ',
  gender: 'Homem',
  lookingFor: ['Mulheres'],
  images: ['https://picsum.photos/400/600?random=99', 'https://picsum.photos/400/600?random=100'],
  bio: 'Designer de dia, gamer à noite. Procurando alguém para me carregar nas rankeadas.',
  rankingEnabled: true,
  loginMethod: 'google',
  height: '',
  currentTag: 'Jogar videogame',
  classification: '',
  billSplit: '',
  availableToday: false
};

type AppStateContextValue = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isPremium: boolean;
  setIsPremium: React.Dispatch<React.SetStateAction<boolean>>;
  myProfile: MyProfile;
  setMyProfile: React.Dispatch<React.SetStateAction<MyProfile>>;
  updateProfile: (key: keyof MyProfile, value: any) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function readCachedProfile(): MyProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<MyProfile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function readCachedPremium(): boolean {
  try {
    const raw = window.localStorage.getItem(PREMIUM_CACHE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export const AppStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean>(() => readCachedPremium());
  const [myProfile, setMyProfile] = useState<MyProfile>(() => readCachedProfile());

  const updateProfile = (key: keyof MyProfile, value: any) => {
    setMyProfile((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(myProfile));
    } catch {
      // noop
    }
  }, [myProfile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREMIUM_CACHE_KEY, isPremium ? 'true' : 'false');
    } catch {
      // noop
    }
  }, [isPremium]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      isPremium,
      setIsPremium,
      myProfile,
      setMyProfile,
      updateProfile
    }),
    [isAuthenticated, isPremium, myProfile]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
