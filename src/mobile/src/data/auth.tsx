import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type StaffRole = 'cashier' | 'admin';

/** Сесія працівника. Роль береться з JWT після `POST /v1/auth/login`. */
export interface StaffSession {
  role: StaffRole;
  login: string;
}

/** Помилки входу — коди з `docs/api/openapi.yaml`. */
export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'TOO_MANY_REQUESTS' | 'NETWORK';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode, public readonly lockedUntil?: string) {
    super(code);
  }
}

export interface AuthService {
  login(login: string, password: string): Promise<StaffSession>;
}

/** Обмеження з `LoginRequest`: логін 3–100 символів `[A-Za-z0-9._-]`, пароль 12–128 символів. */
export const LOGIN_PATTERN = /^[A-Za-z0-9._-]{3,100}$/;
export const PASSWORD_MIN = 12;

interface AuthContextValue {
  session: StaffSession | null;
  signIn: (session: StaffSession) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, initialSession = null }: { children: ReactNode; initialSession?: StaffSession | null }) {
  const [session, setSession] = useState<StaffSession | null>(initialSession);
  const value = useMemo<AuthContextValue>(() => ({ session, signIn: setSession, signOut: () => setSession(null) }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth потрібно викликати всередині AuthProvider');
  return ctx;
}
