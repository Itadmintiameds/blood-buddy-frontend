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

// Matches bloodbuddy.backend.common.PagedResponse<T>: a trimmed page envelope
// the backend sends instead of Spring's raw Page JSON. `page` is zero-based.
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
