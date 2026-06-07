import { createContext, useContext, useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = "auth_token";

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function applyUser(nextUser) {
    setUser(nextUser);
  }

  async function resolveSession() {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.user ?? null;
  }

  async function refreshSession() {
    try {
      const nextUser = await resolveSession();
      applyUser(nextUser);
      return nextUser;
    } catch {
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
      applyUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  function syncUser(nextUser) {
    applyUser(nextUser);
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const nextUser = await resolveSession();

        if (!isMounted) {
          return;
        }

        applyUser(nextUser);
      } catch {
      if (!isMounted) {
        return;
      }

      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
      applyUser(null);
    } finally {
      if (isMounted) {
        setLoading(false);
        }
      }
    }

    function handleUnauthorized() {
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
      applyUser(null);
    }

    hydrateSession();
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  async function login(payload) {
    try {
      const response = await axiosInstance.post("/api/auth/login", payload);
      const token = response.data.token;

      if (token) {
        window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      }

      applyUser(response.data.user);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Login failed"));
    }
  }

  async function register(payload) {
    try {
      const response = await axiosInstance.post("/api/auth/register", payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Registration failed"));
    }
  }

  async function logout() {
    try {
      await axiosInstance.post("/api/auth/logout");
    } finally {
      window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
      applyUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshSession,
        register,
        syncUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
