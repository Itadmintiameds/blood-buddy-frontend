export interface ApiError {
  message: string;
  status?: number;
}

// Matches bloodbuddy.backend.common.ApiResponse<T> on the backend: every
// controller wraps its payload this way, and every error response uses the
// same shape with data omitted.
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
