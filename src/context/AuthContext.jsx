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
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const login = useCallback(async (email, password) => {
    setError(null);
    const response = await authService.login({ email, password });
    persistSession(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    const response = await authService.register(data);
    persistSession(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
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
