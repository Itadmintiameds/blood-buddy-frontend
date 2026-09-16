"use client";

export type AuthUserType = "SUPER_ADMIN" | "BLOOD_CENTRE";

export interface AuthSession {
  isLoggedIn: true;
  userType: AuthUserType;
  id: number;
  name?: string;
  email: string;
  role?: string;
  accessToken: string;
  refreshToken?: string;
  loggedInAt: string;
}

// Storage Key
const AUTH_KEY = "bloodBuddyAuth";

// Save Common Auth Session
export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

// Get Common Auth Session
export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = localStorage.getItem(AUTH_KEY);

    if (!storedSession) {
      return null;
    }

    const parsed = JSON.parse(storedSession) as Partial<AuthSession>;

    if (
      parsed.isLoggedIn !== true ||
      !parsed.userType ||
      !parsed.email ||
      !parsed.accessToken
    ) {
      return null;
    }

    return parsed as AuthSession;
  } catch (error) {
    console.error("Unable to read auth session:", error);

    localStorage.removeItem(AUTH_KEY);

    return null;
  }
}

// Check Login
export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}

// Check Super Admin
export function isSuperAdminLoggedIn(): boolean {
  const session = getAuthSession();

  return session?.userType === "SUPER_ADMIN" && session?.role === "SUPERADMIN";
}

// Check Blood Centre
export function isBloodCentreLoggedIn(): boolean {
  const session = getAuthSession();

  return session?.userType === "BLOOD_CENTRE";
}

// Blood Centre Compatibility Session-
// Your existing BloodCentreDashboardScreen is already using:
// getBloodCentreSession()
// So keep this helper to avoid changing every existing screen.

export interface BloodCentreSession {
  isLoggedIn: true;
  userType: "BLOOD_CENTRE";
  id: number;
  email: string;
  accessToken: string;
  loggedInAt: string;
  name?: string;
  role?: string;
}

export function getBloodCentreSession(): BloodCentreSession | null {
  const session = getAuthSession();

  if (!session || session.userType !== "BLOOD_CENTRE") {
    return null;
  }

  return session as BloodCentreSession;
}

// Super Admin Session
export interface SuperAdminSession {
  isLoggedIn: true;
  userType: "SUPER_ADMIN";
  id: number;
  name?: string;
  email: string;
  role: "SUPERADMIN";
  accessToken: string;
  loggedInAt: string;
}

export function getSuperAdminSession(): SuperAdminSession | null {
  const session = getAuthSession();

  if (
    !session ||
    session.userType !== "SUPER_ADMIN" ||
    session.role !== "SUPERADMIN"
  ) {
    return null;
  }

  return session as SuperAdminSession;
}

// Access Token
export function getAccessToken(): string | null {
  const session = getAuthSession();

  return session?.accessToken ?? null;
}

// Refresh Token
export function getRefreshToken(): string | null {
  const session = getAuthSession();

  return session?.refreshToken ?? null;
}

// Patch the stored session with a freshly-issued access (and optionally
// refresh) token, e.g. after POST /auth/refresh. No-ops if nobody is
// logged in (session must already exist).
export function updateTokens(accessToken: string, refreshToken?: string): void {
  const session = getAuthSession();

  if (!session) {
    return;
  }

  saveAuthSession({
    ...session,
    accessToken,
    refreshToken: refreshToken ?? session.refreshToken,
  });
}

// Logout
export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(AUTH_KEY);

  // Existing Blood Centre registration/OTP storage
  sessionStorage.removeItem("bloodCentreMobile");
}

// Compatibility Logout Names
export function logoutBloodCentre(): void {
  logout();
}

export function logoutSuperAdmin(): void {
  logout();
}
