const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
export const API_URL =
  rawApiUrl ?? (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "");

export async function safeApiJson<T = unknown>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getErrorMessage(data: unknown, fallback = "Ein unbekannter Fehler ist aufgetreten."): string {
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) {
    return data
      .map((item) => getErrorMessage(item, fallback))
      .filter(Boolean)
      .join("; ");
  }
  if (data && typeof data === "object") {
    if ("detail" in data) {
      return getErrorMessage((data as any).detail, fallback);
    }
    if ("msg" in data) {
      return String((data as any).msg);
    }
    if ("message" in data) {
      return String((data as any).message);
    }
    return Object.values(data)
      .map((value) => getErrorMessage(value, fallback))
      .filter(Boolean)
      .join("; ");
  }
  return fallback;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
