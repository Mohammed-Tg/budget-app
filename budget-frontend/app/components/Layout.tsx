"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Navbar />
      <main className="mx-auto w-full flex-1 max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
