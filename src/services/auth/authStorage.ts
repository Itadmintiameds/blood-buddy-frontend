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
  loggedInAt: string;
}

const AUTH_KEY = "bloodBuddyAuth";

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = localStorage.getItem(AUTH_KEY);

    if (!storedSession) {
      return null;
    }

    const session = JSON.parse(storedSession) as Partial<AuthSession>;

    if (
      session.isLoggedIn !== true ||
      !session.userType ||
      !session.email ||
      !session.accessToken
    ) {
      return null;
    }

    return session as AuthSession;
  } catch (error) {
    console.error("Unable to read authentication session:", error);

    localStorage.removeItem(AUTH_KEY);

    return null;
  }
}

export function getSuperAdminSession() {
  const session = getAuthSession();

  if (
    !session ||
    session.userType !== "SUPER_ADMIN" ||
    session.role !== "SUPERADMIN"
  ) {
    return null;
  }

  return session;
}

export function getBloodCentreSession() {
  const session = getAuthSession();

  if (!session || session.userType !== "BLOOD_CENTRE") {
    return null;
  }

  return session;
}

export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem("bloodCentreMobile");
}

export function logoutSuperAdmin(): void {
  logout();
}

export function logoutBloodCentre(): void {
  logout();
}
