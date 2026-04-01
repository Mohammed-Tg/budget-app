"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const getAuthState = () => Boolean(localStorage.getItem("token"));

    setIsAuthenticated(getAuthState());

    const syncAuthState = () => {
      setIsAuthenticated(getAuthState());
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("authchange", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authchange", syncAuthState);
    };
  }, []);

  return isAuthenticated;
}

export function useProtectedRoute() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [router]);

  return { authorized, checking };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authchange"));
  }
}
