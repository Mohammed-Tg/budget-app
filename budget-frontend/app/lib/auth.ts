"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProtectedRoute() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  return checked;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}
