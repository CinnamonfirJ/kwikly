"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/toast-provider";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  user: User | null;
  signup: (credentials: {
    name: string;
    email: string;
    password: string;
  }) => void;
  login: (credentials: { email: string; password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isPending: true,
  isError: false,
  error: null,
  user: null,
  signup: async () => {},
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToastContext();
  const queryClient = useQueryClient();

  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/user");
      if (res.status === 401) {
        return null;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch user");
      }
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const {
    data: userData,
    isLoading: userLoading,
    isError: userErrorFetching,
    error: userErrorObject,
    // isFetched,
  } = useQuery<User | null, Error>({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const isAuthenticated = !!userData;
  const isError = userErrorFetching;
  const error = userErrorObject;

  const [isPending, setIsPending] = useState(true);

  // --- Auth Mutations ---

  // Declare loginFn and its mutation first
  const loginFn = async (credentials: { email: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  };

  const { mutate: loginMutate, isPending: isLoginPending } = useMutation({
    mutationFn: loginFn,
    onMutate: () => setIsPending(true),
    onError: (err: Error) => {
      toast.error(err.message);
      setIsPending(false);
    },
    onSuccess: async () => {
      toast.success("Login Successful");
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  // Now declare signupFn and its mutation
  const signupFn = async (credentials: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }
    return data;
  };

  const { mutate: signupMutate, isPending: isSignupPending } = useMutation({
    mutationFn: signupFn,
    onMutate: () => setIsPending(true),
    onError: (err: Error) => {
      toast.error(err.message);
      setIsPending(false);
    },
    onSuccess: async (data, variables) => {
      toast.success("Signup Successful");
      await loginFn(variables); // loginFn is now declared and accessible
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  const logoutFn = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Logout failed");
    }
    return data;
  };

  const { mutate: logoutMutate, isPending: isLogoutPending } = useMutation({
    mutationFn: logoutFn,
    onMutate: () => {
      setIsPending(true);
      queryClient.setQueryData(["authUser"], null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setIsPending(false);
    },
    onSuccess: () => {
      toast.success("Logout Successful");
      router.push("/");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsPending(false);
    },
  });

  // Combine pending states
  const overallPending =
    isLoginPending || isSignupPending || isLogoutPending || userLoading;

  useEffect(() => {
    setIsPending(overallPending);
  }, [overallPending]);

  const signup = (credentials: {
    name: string;
    email: string;
    password: string;
  }) => {
    signupMutate(credentials);
  };

  const login = (credentials: { email: string; password: string }) => {
    loginMutate(credentials);
  };

  const logout = () => {
    logoutMutate();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPending,
        signup,
        login,
        logout,
        isError,
        error,
        user: userData || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
