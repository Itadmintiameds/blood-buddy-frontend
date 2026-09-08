import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: config?.method?.toUpperCase(),
        baseURL: config?.baseURL,
        url: config?.url,
        data: config?.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        status: response?.status,
        url: response?.config?.url,
        data: response?.data,
      });
    }

    return response;
  },
  (error) => {
    console.error("API Error:", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      url: error?.config?.url,
      responseData: error?.response?.data,
    });

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    if (error?.response?.data) {
      const data = error?.response?.data;

      if (typeof data === "string" && data?.trim()) {
        return data;
      }

      if (typeof data === "object" && data !== null) {
        const responseData = data as {
          message?: unknown;
          error?: unknown;
          detail?: unknown;
        };

        if (
          typeof responseData.message === "string" &&
          responseData?.message?.trim()
        ) {
          return responseData?.message;
        }

        if (
          typeof responseData.error === "string" &&
          responseData?.error?.trim()
        ) {
          return responseData?.error;
        }

        if (
          typeof responseData?.detail === "string" &&
          responseData?.detail?.trim()
        ) {
          return responseData?.detail;
        }
      }
    }

    if (error?.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please check that the backend is running.";
    }

    if (error?.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    if (error?.response?.status === 400) {
      return "Invalid email or password.";
    }

    if (error?.response?.status === 401) {
      return "Invalid email or password.";
    }

    if (error?.response?.status === 403) {
      return "You are not authorized to login.";
    }

    if (
      error?.response?.status !== undefined &&
      error?.response?.status >= 500
    ) {
      return "Server error. Please try again later.";
    }
  }

  if (error instanceof Error && error?.message) {
    return error?.message;
  }

  return fallback;
}
