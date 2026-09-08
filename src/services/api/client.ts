import axios, { type AxiosError } from "axios";

// Browser requests use a same-origin Next.js proxy.
// /backend-api

const baseURL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "/backend-api"
).replace(/\/+$/, "");

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ""}/${String(config.url || "").replace(/^\/+/, "")}`,
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        responseData: error.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

function readMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return null;

  const value = data as {
    message?: unknown;
    error?: unknown;
    detail?: unknown;
    errors?: Record<string, unknown>;
  };

  if (typeof value.message === "string" && value.message.trim())
    return value.message.trim();
  if (typeof value.error === "string" && value.error.trim())
    return value.error.trim();
  if (typeof value.detail === "string" && value.detail.trim())
    return value.detail.trim();

  if (value.errors && typeof value.errors === "object") {
    const first = Object.values(value.errors).find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    if (first) return first.trim();
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const message = readMessage(error.response?.data);
  if (message) return message;

  if (error.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please make sure the Spring Boot backend is running on http://localhost:8080 and try again.";
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "The request timed out. Please try again.";
  }

  switch (error.response?.status) {
    case 400:
      return "Invalid request. Please check the entered details.";
    case 401:
      return "Invalid email or password.";
    case 403:
      return "You are not authorized to perform this action.";
    case 404:
      return "Requested API endpoint was not found.";
    case 409:
      return "This information already exists.";
    default:
      if (error.response?.status && error.response.status >= 500) {
        return "Server error. Please try again later.";
      }
  }

  return fallback;
}
