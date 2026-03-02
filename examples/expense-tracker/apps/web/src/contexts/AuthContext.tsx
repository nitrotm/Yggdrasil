import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../api/client";

interface User {
  userId: number;
  email: string;
  plan: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t } = await api.post<{ token: string }>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", t);
    setToken(t);
    const payload = JSON.parse(atob(t.split(".")[1]));
    setUser({ userId: payload.sub, email: payload.email, plan: payload.plan });
  }, []);

  const register = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      const { token: t } = await api.post<{ token: string }>("/auth/register", {
        email,
        password,
        passwordConfirm,
      });
      localStorage.setItem("token", t);
      setToken(t);
      const payload = JSON.parse(atob(t.split(".")[1]));
      setUser({ userId: payload.sub, email: payload.email, plan: payload.plan });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      const me = await api.get<{ id: number; email: string }>("/users/me");
      const sub = await api.get<{ plan: string }>("/subscriptions/me");
      setUser({
        userId: me.id,
        email: me.email,
        plan: sub.plan,
      });
    } catch {
      logout();
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
