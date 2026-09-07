const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bt_token');
}

export function setToken(token: string) {
  localStorage.setItem('bt_token', token);
}

export function clearToken() {
  localStorage.removeItem('bt_token');
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
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
  uploadBooks: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return request('/books/upload', { method: 'POST', body: form });
  },
  listBooks: () => request('/books'),
  bookStatus: (id: string) => request(`/books/${id}/status`),
  dailyToday: () => request('/daily/today'),
  dueCards: () => request('/reviews/due'),
  submitReview: (cardId: string, response: string) =>
    request(`/reviews/${cardId}`, { method: 'POST', body: JSON.stringify({ response }) }),

  // Billing / subscription
  billingStatus: () => request('/billing/status'),
  createSubscription: (plan: 'monthly' | 'yearly') =>
    request('/billing/create-subscription', { method: 'POST', body: JSON.stringify({ plan }) }),

  // Notifications
  telegramLinkCode: () => request('/users/me/telegram/link-code'),
  telegramStatus: () => request('/users/me/telegram/status'),
  updateWhatsapp: (phoneNumber: string | null, enabled: boolean) =>
    request('/users/me/whatsapp', {
      method: 'PATCH',
      body: JSON.stringify({ phone_number: phoneNumber, enabled }),
    }),

  // Support
  createTicket: (subject: string, message: string) =>
    request('/support/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) }),
  myTickets: () => request('/support/tickets'),

  // Google Drive import
  importFromDrive: (fileIds: string[], accessToken: string) =>
    request('/books/import-drive', {
      method: 'POST',
      body: JSON.stringify({ file_ids: fileIds, access_token: accessToken }),
    }),

  // Admin
  adminListUsers: (search?: string) =>
    request(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  adminListTickets: (status?: string) =>
    request(`/admin/support/tickets${status ? `?status=${status}` : ''}`),
  adminUpdateTicket: (ticketId: string, updates: { status?: string; admin_notes?: string }) =>
    request(`/admin/support/tickets/${ticketId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  adminExtendTrial: (userId: string, days = 7) =>
    request(`/admin/users/${userId}/extend-trial?days=${days}`, { method: 'POST' }),
  adminSetSubscriptionStatus: (userId: string, status: string) =>
    request(`/admin/users/${userId}/set-subscription-status?status=${status}`, { method: 'POST' }),
  adminAnalyticsOverview: () => request('/admin/analytics/overview'),
  adminSignupsOverTime: (days = 30) => request(`/admin/analytics/signups-over-time?days=${days}`),
};

export { ApiError };
