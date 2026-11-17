import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize state with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        const profileData = userDoc.exists() ? userDoc.data() : {};

        if (profileData.blocked) {
          await authService.logout();
          setUser(null);
        } else {
          setUser({
            id: fbUser.uid,
            uid: fbUser.uid,
            name: profileData.name || fbUser.displayName || "User",
            email: fbUser.email,
            phone: profileData.phone || fbUser.phoneNumber || "",
            role: profileData.role || "customer",
            blocked: !!profileData.blocked,
            createdAt: profileData.createdAt || new Date().toISOString(),
            addresses: profileData.addresses || [],
            ...profileData,
          });
        }
      } catch (err) {
        console.warn("[AuthContext] Error fetching profile from Firestore:", err.message);
        setUser({
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || "User",
          email: fbUser.email,
          role: "customer",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const response = await authService.login({ email, password });
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    const response = await authService.register(data);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return null;
      const updated = await authService.updateProfile(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user]
  );

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    const response = await authService.loginWithGoogle();
    setUser(response.user);
    return response.user;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    error,
    login,
    loginWithGoogle,
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
