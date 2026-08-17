import type {
  AdminStats,
  ApiResponse,
  AuthTokens,
  Booking,
  CreateBookingPayload,
  CreatePropertyPayload,
  CreateRoomPayload,
  CreateRoomTypePayload,
  Notification,
  PaginatedResponse,
  Property,
  PropertyDetail,
  PropertyFilters,
  Room,
  RoomType,
  User,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

let refreshPromise: Promise<string | null> | null = null;

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json: ApiResponse<AuthTokens> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    clearTokens();
    return null;
  }

  setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let json: ApiResponse<T>;
  try {
    json = text ? JSON.parse(text) : { success: false, error: 'Empty response from server' };
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid response from server'
        : `Server unavailable (${res.status}). Is the API running on port 4000?`
    );
  }

  if (res.status === 401 && retry && getRefreshToken()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) return request<T>(path, options, false);
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? 'Request failed');
  }

  return json.data as T;
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });
  const s = query.toString();
  return s ? `?${s}` : '';
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name: string, email: string, password: string) =>
      request<AuthTokens>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    me: () => request<User>('/auth/me'),
  },

  properties: {
    list: (filters?: PropertyFilters) =>
      request<PaginatedResponse<Property>>(`/properties${buildQuery(filters as Record<string, string | number | undefined>)}`),
    get: (id: string, params?: { startMonth?: string; duration?: number }) =>
      request<PropertyDetail>(`/properties/${id}${buildQuery(params)}`),
    map: (lat: number, lng: number, radius = 50000) =>
      request<Property[]>(`/properties/map?lat=${lat}&lng=${lng}&radius=${radius}`),
  },

  bookings: {
    my: () => request<Booking[]>('/bookings/my'),
    create: (data: CreateBookingPayload) =>
      request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id: string) =>
      request<Booking>(`/bookings/${id}/confirm`, { method: 'POST' }),
    cancel: (id: string) =>
      request<Booking>(`/bookings/${id}/cancel`, { method: 'POST' }),
  },

  favourites: {
    list: () => request<Property[]>('/favourites'),
    add: (propertyId: string) =>
      request<{ message: string }>(`/favourites/${propertyId}`, { method: 'POST' }),
    remove: (propertyId: string) =>
      request<{ message: string }>(`/favourites/${propertyId}`, { method: 'DELETE' }),
  },

  notifications: {
    list: () => request<Notification[]>('/notifications'),
    unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) =>
      request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
  },

  profile: {
    update: (data: Partial<Pick<User, 'name' | 'bio'>>) =>
      request<User>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  admin: {
    stats: () => request<AdminStats>('/admin/stats'),
    bookings: () => request<Booking[]>('/admin/bookings'),
    properties: () => request<Property[]>('/admin/properties'),
    createProperty: (data: CreatePropertyPayload) =>
      request<Property>('/admin/properties', { method: 'POST', body: JSON.stringify(data) }),
    updateProperty: (id: string, data: Partial<CreatePropertyPayload>) =>
      request<Property>(`/admin/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteProperty: (id: string) =>
      request<{ message: string }>(`/admin/properties/${id}`, { method: 'DELETE' }),
    createRoomType: (propertyId: string, data: CreateRoomTypePayload) =>
      request<RoomType>(`/admin/properties/${propertyId}/room-types`, { method: 'POST', body: JSON.stringify(data) }),
    updateRoomType: (id: string, data: Partial<CreateRoomTypePayload>) =>
      request<RoomType>(`/admin/room-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteRoomType: (id: string) =>
      request<{ message: string }>(`/admin/room-types/${id}`, { method: 'DELETE' }),
    createRoom: (roomTypeId: string, data: CreateRoomPayload) =>
      request<Room>(`/admin/room-types/${roomTypeId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),
    updateRoom: (id: string, data: Partial<CreateRoomPayload>) =>
      request<Room>(`/admin/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteRoom: (id: string) =>
      request<{ message: string }>(`/admin/rooms/${id}`, { method: 'DELETE' }),
  },
};

export function imageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonthInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function nextMonthInput() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return formatMonthInput(d);
}
