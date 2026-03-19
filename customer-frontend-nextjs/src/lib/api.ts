const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

// Join the backend base URL with a relative API path.
const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Read the JSON body from a response when the server sent JSON.
const readJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Send a request to the backend and return the parsed JSON payload.
export const requestApi = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...init.headers,
    },
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

// Attach a bearer token to request headers when the user is signed in.
export const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
