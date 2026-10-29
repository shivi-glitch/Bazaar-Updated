const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = {
  async post(endpoint: string, body: any, token?: string) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    return res.json();
  },

  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const sep = endpoint.includes("?") ? "&" : "?";
    const cacheBuster = `${sep}_t=${Date.now()}`;
    const res = await fetch(`${API_BASE}${endpoint}${cacheBuster}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  },
};
