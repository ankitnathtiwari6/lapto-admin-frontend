import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api, { setAuthToken, removeAuthToken } from "../lib/api";
import type { User, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setAuthToken(token);
          // First, set the stored user immediately to avoid redirect
          setUser(JSON.parse(storedUser));
          // Then verify with backend
          const { data } = await api.get<AuthResponse>("/auth/me");
          setUser(data.data.user);
        } catch (error) {
          // Only clear auth if the token is invalid
          console.error("Auth verification failed:", error);
          removeAuthToken();
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", {
        phone,
        password,
      });
      const { user, token } = data.data;

      setAuthToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
