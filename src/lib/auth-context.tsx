"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AuthSession {
  driverId: number;
  fullName: string;
  phoneNumber: string;
  driverCode?: string;
  carrierId?: string;
  license?: string;
  licenseType?: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("auth_session");
    return stored ? JSON.parse(stored) : null;
  });

  const setSession = useCallback((s: AuthSession | null) => {
    setSessionState(s);
    if (s) sessionStorage.setItem("auth_session", JSON.stringify(s));
    else sessionStorage.removeItem("auth_session");
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    sessionStorage.clear();
  }, [setSession]);

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
