// Kept as a thin re-export so existing "@/utils/api" imports keep working.
// The real client lives in "@/services/api/client" — see that file for the
// baseURL, auth-token interceptor, and error-message logic.
export { api, getApiErrorMessage } from "@/services/api/client";
