"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "../lib/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-xl font-semibold text-white shadow-sm">
              B
            </div>
            <div>
              <p className="text-lg font-semibold">Budget App</p>
              <p className="text-sm text-slate-500">Einnahmen, Ausgaben und Budget im Blick</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            <Link href="/" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Startseite
            </Link>
            <Link href="/dashboard" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Dashboard
            </Link>
            <Link href="/transactions" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Transaktionen
            </Link>
            <Link href="/login" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Login
            </Link>
            <Link href="/register" className="rounded-full px-4 py-2 hover:bg-slate-100">
              Registrieren
            </Link>
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Abmelden
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full flex-1 max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}