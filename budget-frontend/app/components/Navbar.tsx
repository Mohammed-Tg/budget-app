"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useAuth } from "../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const authState = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-xl font-semibold text-white shadow-sm">
            B
          </div>
          <div>
            <p className="text-lg font-semibold">Budget-App</p>
            <p className="text-sm text-slate-500">Einnahmen, Ausgaben und Budget im Blick</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          <Link href="/" className="rounded-full px-4 py-2 hover:bg-slate-100">
            Startseite
          </Link>

          {authState === null ? null : authState ? (
            <>
              <Link href="/dashboard" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Übersicht
              </Link>
              <Link href="/transactions" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Transaktionen
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Anmelden
              </Link>
              <Link href="/register" className="rounded-full px-4 py-2 hover:bg-slate-100">
                Registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
