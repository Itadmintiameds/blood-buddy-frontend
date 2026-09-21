"use client";

import { api } from "@/services/api/client";

// POST /auth/logout invalidates the session on the backend. Best-effort:
// local session storage is always cleared by the caller regardless of
// whether this succeeds, so a failure here must never block logout.
export async function logoutServerSide(): Promise<void> {
  try {
    await api.post("/auth/logout", undefined, { timeout: 5000 });
  } catch (error) {
    console.error("Server logout failed (continuing with local logout):", error);
  }
}
