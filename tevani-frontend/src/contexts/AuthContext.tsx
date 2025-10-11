'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  type: "business" | "investor";
  business_profile?: any;
  investor_profile?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, type: "business" | "investor") => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("tevani_token");
    const storedUser = localStorage.getItem("tevani_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("tevani_token");
        localStorage.removeItem("tevani_user");
      }
    }

    setLoading(false);

    // If token exists, validate it with the server
    if (token) {
      authAPI.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("tevani_user", JSON.stringify(userData));
        })
        .catch((error) => {
          console.error("Failed to validate token:", error);
          localStorage.removeItem("tevani_token");
          localStorage.removeItem("tevani_user");
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string, type: "business" | "investor") => {
    try {
      // Make API call to the backend for authentication
      const response = await authAPI.login(email, password, type);
      
      // Store token in localStorage
      localStorage.setItem("tevani_token", response.access_token);
      
      // Fetch user data using the token
      const userData = await authAPI.getMe();
      
      // Check if user type matches the requested type
      if (userData.type !== type) {
        // Clear token and throw error
        localStorage.removeItem("tevani_token");
        throw new Error(`This email is registered as a ${userData.type} account, not as a ${type} account.`);
      }
      
      // Store user data in localStorage
      localStorage.setItem("tevani_user", JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Make API call to the backend for registration
      const user = await authAPI.register(userData);
      
      // After registration, login the user
      await login(userData.email, userData.password, userData.type);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("tevani_token");
    localStorage.removeItem("tevani_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Made with Bob
