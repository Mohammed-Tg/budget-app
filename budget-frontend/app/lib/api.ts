const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
export const API_URL = rawApiUrl ?? "http://127.0.0.1:8000";

export interface ApiFetchError {
  status: number;
  message: string;
}

export interface ApiFetchResponse {
  response: Response;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  headers: Headers;
  error?: ApiFetchError;
  json: <T = unknown>() => Promise<T | null>;
  text: () => Promise<string | null>;
}

export async function safeApiJson<T = unknown>(response: { json: () => Promise<unknown> }): Promise<T | null> {
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

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<ApiFetchResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Netzwerkfehler beim Abrufen der Daten.";
    const fallbackResponse = new Response(null, {
      status: 502,
      statusText: "Netzwerkfehler",
    });

    return {
      response: fallbackResponse,
      ok: false,
      status: 502,
      statusText: "Netzwerkfehler",
      url: "",
      headers: new Headers(),
      error: {
        status: 502,
        message,
      },
      json: async () => null,
      text: async () => message,
    };
  }

  const parseJson = async <T = unknown>(): Promise<T | null> => {
    try {
      return (await response.json()) as T;
    } catch {
      return null;
    }
  };

  const parseText = async (): Promise<string | null> => {
    try {
      return await response.text();
    } catch {
      return null;
    }
  };

  const apiResponse: ApiFetchResponse = {
    response,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    headers: response.headers,
    json: parseJson,
    text: parseText,
  };

  if (!response.ok) {
    const body = await parseJson();
    const message = body ? getErrorMessage(body, response.statusText) : (await parseText()) || response.statusText || "Ein unbekannter Fehler ist aufgetreten.";
    apiResponse.error = {
      status: response.status,
      message,
    };
  }

  return apiResponse;
}
