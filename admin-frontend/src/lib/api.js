const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const getAuthToken = () => localStorage.getItem("token");

export const withAuthHeaders = (headers = {}) => {
  const token = getAuthToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

export const apiRequest = async (path, options = {}) => {
  const { headers = {}, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: withAuthHeaders(headers),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
