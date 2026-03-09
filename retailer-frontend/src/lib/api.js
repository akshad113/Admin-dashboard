import { clearRetailerSession, getRetailerToken } from "./auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiRequest = async (path, options = {}) => {
  const token = getRetailerToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearRetailerSession();
    }

    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload.trim().length > 0
        ? payload
        : `Request failed with status ${response.status}`);

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (!isJson) {
    throw new Error("API did not return JSON. Check backend URL or Vite proxy configuration.");
  }

  return payload;
};
