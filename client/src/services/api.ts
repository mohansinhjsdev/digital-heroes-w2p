const API_BASE = "http://localhost:5000/api/v1";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("dh_token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "omit",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
