/**
 * Admin API client — wraps fetch with auth headers for GEX44 admin endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_GEX44_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function adminFetch(path: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  // Don't set Content-Type when there's no body (avoids FastAPI trying to parse empty body)
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Dashboard
export const getDashboard = (token: string) =>
  adminFetch("/api/hz/admin/dashboard", { token });

// Fans
export const getFans = (token: string, params?: { search?: string; page?: number; sort?: string }) => {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.sort) query.set("sort", params.sort);
  return adminFetch(`/api/hz/admin/fans?${query}`, { token });
};

export const getFan = (token: string, fanId: string) =>
  adminFetch(`/api/hz/admin/fans/${fanId}`, { token });

export const updateFan = (token: string, fanId: string, data: Record<string, unknown>) =>
  adminFetch(`/api/hz/admin/fans/${fanId}`, { token, method: "PUT", body: JSON.stringify(data) });

export const deleteFan = (token: string, fanId: string) =>
  adminFetch(`/api/hz/admin/fans/${fanId}`, { token, method: "DELETE" });

export const updateFanMetadata = (token: string, fanId: string, key: string, value: string) =>
  adminFetch(`/api/hz/admin/fans/${fanId}/metadata/${encodeURIComponent(key)}`, {
    token, method: "PUT", body: JSON.stringify({ value }),
  });

export const deleteFanMetadata = (token: string, fanId: string, key: string) =>
  adminFetch(`/api/hz/admin/fans/${fanId}/metadata/${encodeURIComponent(key)}`, {
    token, method: "DELETE",
  });

// Offerings
export const getOfferings = (token: string, params?: { status?: string; page?: number }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return adminFetch(`/api/hz/admin/offerings?${query}`, { token });
};

export const createOffering = (token: string, formData: FormData) =>
  adminFetch("/api/hz/admin/offerings", { token, method: "POST", body: formData });

export const updateOffering = (token: string, id: string, data: Record<string, unknown>) =>
  adminFetch(`/api/hz/admin/offerings/${id}`, { token, method: "PUT", body: JSON.stringify(data) });

export const deleteOffering = (token: string, id: string) =>
  adminFetch(`/api/hz/admin/offerings/${id}`, { token, method: "DELETE" });

export const reviewOffering = (token: string, id: string, action: string) =>
  adminFetch(`/api/hz/admin/offerings/${id}/review`, {
    token, method: "POST", body: JSON.stringify({ action }),
  });

// Reactions
export const getReactions = (token: string, params?: { status?: string; page?: number }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return adminFetch(`/api/hz/admin/reactions?${query}`, { token });
};

export const reviewReaction = (token: string, id: string, action: string) =>
  adminFetch(`/api/hz/admin/reactions/${id}/review`, {
    token, method: "POST", body: JSON.stringify({ action }),
  });

// Claims
export const getClaims = (token: string, params?: { status?: string; page?: number }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  return adminFetch(`/api/hz/admin/claims?${query}`, { token });
};

export const reviewClaim = (token: string, id: string, action: string) =>
  adminFetch(`/api/hz/admin/claims/${id}/review`, {
    token, method: "POST", body: JSON.stringify({ action }),
  });

// Chronicle
export const getChronicle = (token: string) =>
  adminFetch("/api/hz/admin/chronicle", { token });

export const createChronicleEvent = (token: string, data: {
  date_display: string; title: string; body: string;
  era?: string; video_url?: string; sort_order?: number;
}) => adminFetch("/api/hz/admin/chronicle", { token, method: "POST", body: JSON.stringify(data) });

export const updateChronicleEvent = (token: string, id: string, data: Record<string, unknown>) =>
  adminFetch(`/api/hz/admin/chronicle/${id}`, { token, method: "PUT", body: JSON.stringify(data) });

export const deleteChronicleEvent = (token: string, id: string) =>
  adminFetch(`/api/hz/admin/chronicle/${id}`, { token, method: "DELETE" });

export const addChronicleMedia = (token: string, eventId: string, formData: FormData) =>
  adminFetch(`/api/hz/admin/chronicle/${eventId}/media`, { token, method: "POST", body: formData });

export const deleteChronicleMedia = (token: string, mediaId: string) =>
  adminFetch(`/api/hz/admin/chronicle/media/${mediaId}`, { token, method: "DELETE" });

export const addChronicleTrack = (token: string, eventId: string, name: string) =>
  adminFetch(`/api/hz/admin/chronicle/${eventId}/tracks`, {
    token, method: "POST", body: JSON.stringify({ name }),
  });

export const deleteChronicleTrack = (token: string, trackId: string) =>
  adminFetch(`/api/hz/admin/chronicle/tracks/${trackId}`, { token, method: "DELETE" });

// Sanctuary
export const getSanctuary = (token: string, params?: { reviewed?: string; page?: number }) => {
  const query = new URLSearchParams();
  if (params?.reviewed) query.set("reviewed", params.reviewed);
  if (params?.page) query.set("page", String(params.page));
  return adminFetch(`/api/hz/admin/sanctuary?${query}`, { token });
};

export const reviewSanctuary = (token: string, id: string, notes?: string) =>
  adminFetch(`/api/hz/admin/sanctuary/${id}/review`, {
    token, method: "POST", body: JSON.stringify({ notes: notes || null }),
  });

export const deleteSanctuary = (token: string, id: string) =>
  adminFetch(`/api/hz/admin/sanctuary/${id}`, { token, method: "DELETE" });

// Upload
export const uploadFile = (token: string, formData: FormData) =>
  adminFetch("/api/hz/admin/upload", { token, method: "POST", body: formData });

// Aggregate
export const triggerAggregate = (token: string) =>
  adminFetch("/api/hz/admin/aggregate", { token, method: "POST" });
