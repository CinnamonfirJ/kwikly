"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isAuthenticated: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  login: (credentials: { email: string; password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isPending: true,
  isError: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();

  const getUser = async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Couldn't get User");
      }
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const { data: getUserQuery } = useQuery({
    queryKey: ["authUser"],
    queryFn: getUser,
  });

  useEffect(() => {
    const storedUser = getUserQuery;

    if (storedUser) {
      setIsAuthenticated(true);
    }
    setIsPending(false);
  }, [getUserQuery]);

  const logoutFn = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Couldn't get User");
      }
      router.push("/");
      setIsAuthenticated(false);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const { mutate: LogoutMutate } = useMutation({
    mutationFn: logoutFn,
    onMutate: () => setIsPending(true),
    onError: (error: Error) => {
      setIsError(true);
      setError(error);
      setIsPending(false);
    },
    onSuccess: () => {
      setIsPending(false);
      console.log("Logout Successful", isAuthenticated);
    },
  });

  const loginFn = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setError(null);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const { mutate: LoginMutate } = useMutation({
    mutationFn: loginFn,
    onMutate: () => setIsPending(true),
    onError: (error: Error) => {
      setIsError(true);
      setError(error);
      setIsPending(false);
    },
    onSuccess: () => {
      setIsPending(false);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      console.log("Login Successful", isAuthenticated);
    },
  });

  const login = (credentials: { email: string; password: string }) => {
    LoginMutate(credentials);
  };

  const logout = () => {
    LogoutMutate();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPending,
        login,
        logout,
        isError,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
