"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, safeApiJson } from "../lib/api";
import { useProtectedRoute } from "../lib/auth";

export default function DashboardPage() {
  const { authorized, checking } = useProtectedRoute();
  const [summary, setSummary] = useState<{ income: number; expense: number; balance: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);

  useEffect(() => {
    if (!authorized) return;

    apiFetch("/summary/")
      .then(async (res) => {
        const data = await safeApiJson<{ income: number; expense: number; balance: number }>(res);
        if (!res.ok) {
          throw new Error("Summary konnte nicht geladen werden.");
        }
        if (!data) {
          throw new Error("Summary ist ungültig.");
        }
        setSummary(data);
      })
      .catch((err) => setError(err.message));
  }, [authorized]);

  if (checking) {
    return (
      <Layout>
        <p>Bitte warten...</p>
      </Layout>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <Layout>
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold mb-4">Übersicht</h1>
        <p className="text-slate-600 mb-6">Hier sehen Sie Ihre aktuellen Einnahmen, Ausgaben und den Kontostand.</p>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !summary ? (
          <p>Wird geladen...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="group rounded-3xl border border-emerald-100 bg-emerald-50 p-5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.18em] text-emerald-700">Einnahmen</p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
                  ↑
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-emerald-900">{formatCurrency(summary.income)}</p>
            </div>
            <div className="group rounded-3xl border border-red-100 bg-red-50 p-5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.18em] text-red-700">Ausgaben</p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-800 shadow-sm">
                  ↓
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-red-900">{formatCurrency(summary.expense)}</p>
            </div>
            <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Saldo</p>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm">
                  ≈
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold text-slate-900">{formatCurrency(summary.balance)}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
