import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

// Session (which user is logged in) is kept client-side and persisted to
// localStorage, same reasoning as Cart/Wishlist — but note this only
// stores a user id + token, never a password. The actual account data
// (and validation) lives in authService's mock "users table" for now, and
// would live in a real backend/database once one exists — this context
// would then just be holding a real session token instead of a demo one.

const AuthContext = createContext(null);
const SESSION_KEY = "daalbhat_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session on first load
  const [error, setError] = useState(null);

  // Restore session on first load
  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const { userId } = JSON.parse(session);
      authService
        .getCurrentUser(userId)
        .then(setUser)
        .catch(() => localStorage.removeItem(SESSION_KEY))
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setLoading(false);
    }
  }, []);

  const persistSession = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: loggedInUser.id }));
  };

  const login = useCallback(async (email, password) => {
    setError(null);
    const { user: loggedInUser } = await authService.login({ email, password });
    persistSession(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    const { user: newUser } = await authService.register(data);
    persistSession(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      const updated = await authService.updateProfile(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
