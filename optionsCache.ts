import { apiFetch } from './apiClient';

type OptionsCache = {
  genders: { label: string; group: string }[];
  lookingFor: { label: string; group: string }[];
  relationships: string[];
  classifications: string[];
  billSplitOptions: string[];
  tags: string[];
  educations: string[];
  families: string[];
  signs: string[];
  pets: string[];
  drinks: string[];
  smokes: string[];
  exercises: string[];
  foods: string[];
  sleeps: string[];
  personalityTraits: string[];
  locations: Record<string, string[]>;
};

type CachePayload = {
  etag: string | null;
  data: OptionsCache;
  updatedAt: string;
};

const CACHE_KEY = 'thegame_options_cache';

const readCache = (): CachePayload | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch (err) {
    return null;
  }
};

const writeCache = (etag: string | null, data: OptionsCache) => {
  try {
    const payload: CachePayload = {
      etag,
      data,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    // ignore cache write errors
  }
};

export async function loadOptionsWithCache(): Promise<OptionsCache | null> {
  const cached = readCache();
  const headers: HeadersInit = {};
  if (cached?.etag) headers['If-None-Match'] = cached.etag;

  try {
    const res = await apiFetch('/v1/options/all', { headers });
    if (res.status === 304 && cached) return cached.data;
    if (!res.ok) return cached ? cached.data : null;

    const data = (await res.json()) as OptionsCache;
    const etag = res.headers.get('ETag');
    writeCache(etag, data);
    return data;
  } catch (err) {
    return cached ? cached.data : null;
  }
}
