"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/api";
import { logout } from "@/services/auth.service";

/**
 * User type returned from backend profile API
 * This shape supports role-based dashboards
 */
type User = {
  id: string;
  email: string;
  role: "HR" | "MENTOR" | "INTERN";

  // INTERN → assigned mentor
  mentor?: {
    id: string;
    email: string;
    role: "MENTOR";
  } | null;

  // MENTOR → assigned interns
  interns?: {
    id: string;
    email: string;
    role: "INTERN";
  }[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on app load
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        if (isMounted) setUser(res.data);
      } catch {
        try {
          await api.post("/auth/refresh");
          const res = await api.get("/auth/profile");
          if (isMounted) setUser(res.data);
        } catch {
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // -----------------------------
  // LOGOUT HANDLER
  // -----------------------------
  const logoutUser = async () => {
    try {
      await logout(); // ✅ NOW DEFINED
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// -----------------------------
// ROLE → DASHBOARD MAP
// -----------------------------
export const getDashboardRouteByRole = (role: string) => {
  switch (role) {
    case "HR":
      return "/protected/hr/dashboard";
    case "MENTOR":
      return "/protected/mentor/dashboard";
    case "INTERN":
      return "/protected/intern/dashboard";
    default:
      return "/login";
  }
};
