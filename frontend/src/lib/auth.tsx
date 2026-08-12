"use client";

import { createContext, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearTokens, getToken, setTokens } from "./api";
import type { AuthResponse, User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api<User>("/users/me");
      } catch (err) {
        clearTokens();
        throw err;
      }
    },
    enabled: !!getToken(),
    retry: 1,
  });

  const persistAuth = useCallback(
    (res: AuthResponse) => {
      setTokens(res.access_token, res.refresh_token);
      queryClient.setQueryData(["me"], res.user as User);
    },
    [queryClient]
  );

  const login = async (email: string, password: string) => {
    const res = await api<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    persistAuth(res);
    router.push("/");
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    const res = await api<AuthResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: data,
    });
    persistAuth(res);
    router.push("/");
  };

  const logout = () => {
    clearTokens();
    queryClient.setQueryData(["me"], null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data ?? null,
        loading: meQuery.isLoading,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
}