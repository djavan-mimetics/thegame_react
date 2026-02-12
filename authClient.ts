import { storageGet, storageRemove, storageSet } from './tokenStorage';

const ACCESS_TOKEN_KEY = 'thegame_access_token';
const REFRESH_TOKEN_KEY = 'thegame_refresh_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function setSessionTokens(tokens: SessionTokens) {
  await storageSet(ACCESS_TOKEN_KEY, tokens.accessToken);
  await storageSet(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function clearSessionTokens() {
  await storageRemove(ACCESS_TOKEN_KEY);
  await storageRemove(REFRESH_TOKEN_KEY);
}

export async function getAccessToken() {
  return storageGet(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return storageGet(REFRESH_TOKEN_KEY);
}

export async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    await clearSessionTokens();
    return false;
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  await setSessionTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return true;
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const accessToken = await getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(input, { ...init, headers });
  if (res.status !== 401) return res;

  const refreshed = await refreshSession();
  if (!refreshed) return res;

  const retryHeaders = new Headers(init.headers || {});
  const newAccessToken = await getAccessToken();
  if (newAccessToken) retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
}