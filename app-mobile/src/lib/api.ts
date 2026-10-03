import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Same backend, same contract as the web app — this file is a straight port
// of frontend/lib/api.ts with localStorage swapped for SecureStore (web
// falls back to localStorage since SecureStore isn't available there).
function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Try to derive host IP when running via Expo CLI on physical device or simulator
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
}

export const API_URL = getApiUrl();


// Genre classification returned by the backend after upload
export interface BookGenre {
  genre: 'fiction' | 'non-fiction' | null;
  sub_genre: string | null;
  content_mode: 'companion' | 'extraction' | null;
}

const TOKEN_KEY = 'bt_token';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err: any) {
    throw new ApiError(0, `Network request failed. Could not connect to backend at ${API_URL}. Ensure backend is running on 0.0.0.0:8000.`);
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail?.message || data.detail || detail;
    } catch {
      // non-JSON error body, use default message
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  signup: (email: string, password: string) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  uploadBook: (fileUri: string, fileName: string, mimeType: string) => {
    const form = new FormData();
    // React Native's fetch/FormData accepts this { uri, name, type } shape
    // for a file picked via expo-document-picker — it is not a real Blob.
    form.append('files', { uri: fileUri, name: fileName, type: mimeType } as any);
    return request('/books/upload', { method: 'POST', body: form });
  },

  listBooks: () => request('/books'),
  bookStatus: (id: string) => request(`/books/${id}/status`),
  dailyToday: () => request('/daily/today'),
  dueCards: () => request('/reviews/due'),
  submitReview: (cardId: string, response: string) =>
    request(`/reviews/${cardId}`, { method: 'POST', body: JSON.stringify({ response }) }),

  billingStatus: () => request('/billing/status'),
  createSubscription: (plan: 'monthly' | 'yearly') =>
    request('/billing/create-subscription', { method: 'POST', body: JSON.stringify({ plan }) }),

  telegramLinkCode: () => request('/users/me/telegram/link-code'),
  telegramStatus: () => request('/users/me/telegram/status'),
  updateWhatsapp: (phoneNumber: string | null, enabled: boolean) =>
    request('/users/me/whatsapp', {
      method: 'PATCH',
      body: JSON.stringify({ phone_number: phoneNumber, enabled }),
    }),

  createTicket: (subject: string, message: string) =>
    request('/support/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) }),
  myTickets: () => request('/support/tickets'),
};
