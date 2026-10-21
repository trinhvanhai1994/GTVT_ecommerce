import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppConstant, StringConstant } from "../constants";
import api from "../services/api";

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem(StringConstant.USER_KEY);
    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(StringConstant.USER_KEY);
    localStorage.removeItem(StringConstant.TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem(StringConstant.TOKEN_KEY));

  const logout = () => {
    localStorage.removeItem(StringConstant.TOKEN_KEY);
    localStorage.removeItem(StringConstant.USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener(StringConstant.AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(StringConstant.AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/profile");
        if (cancelled) return;
        const profile = data.data;
        localStorage.setItem(StringConstant.USER_KEY, JSON.stringify(profile));
        setUser(profile);
      } catch {
        if (!cancelled) logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const access = data.data.accessToken;
    const profile = data.data.user;
    localStorage.setItem(StringConstant.TOKEN_KEY, access);
    localStorage.setItem(StringConstant.USER_KEY, JSON.stringify(profile));
    setToken(access);
    setUser(profile);
    return profile;
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/auth/profile");
    const profile = data.data;
    localStorage.setItem(StringConstant.USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const role = String(user?.role || "").toUpperCase();
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: role === AppConstant.ROLE_ADMIN || role === AppConstant.ROLE_PLATFORM_ADMIN,
      isSeller: role === AppConstant.ROLE_SELLER,
      isPlatformAdmin: role === AppConstant.ROLE_PLATFORM_ADMIN || role === AppConstant.ROLE_ADMIN,
      login,
      register,
      logout,
      refreshProfile
    }),
    [user, token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
