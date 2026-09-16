import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  logout,
  updateTokens,
} from "@/services/auth/authStorage";

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
  const token = getAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ""}/${String(config.url || "").replace(/^\/+/, "")}`,
    });
  }
  return config;
});

// Backend AuthResponse (bloodbuddy.backend.dto.auth.AuthResponse), the shape
// POST /auth/refresh returns.
interface RefreshedAuth {
  accessToken: string;
  refreshToken: string;
}

// Shared across concurrent 401s so only one /auth/refresh call is in
// flight at a time; every request that raced into a 401 awaits the same
// promise instead of each triggering its own refresh.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  // Plain axios (not the `api` instance) so this call never re-enters the
  // request/response interceptors above.
  const { data } = await axios.post<{ data: RefreshedAuth }>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
  );

  updateTokens(data.data.accessToken, data.data.refreshToken);

  return data.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= performRefresh().finally(() => {
          refreshPromise = null;
        });

        const newAccessToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Token refresh failed, logging out:", refreshError);
        }

        logout();
      }
    }

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
