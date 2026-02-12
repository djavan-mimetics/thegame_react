import { fetchWithAuth } from './authClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiFetch(input: string, init: RequestInit = {}) {
  const url = `${API_BASE_URL}${input}`;
  return fetchWithAuth(url, init);
}
