"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, safeApiJson } from "../lib/api";
import { useProtectedRoute } from "../lib/auth";

export default function DashboardPage() {
  const isAuthorized = useProtectedRoute();
  const [summary, setSummary] = useState<{ income: number; expense: number; balance: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;

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
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <Layout>
        <p>Bitte warten...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p className="text-slate-600 mb-6">Hier sehen Sie Ihre aktuellen Einnahmen, Ausgaben und den Kontostand.</p>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !summary ? (
          <p>Wird geladen...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase text-slate-500">Einnahmen</p>
              <p className="mt-4 text-3xl font-bold">€{summary.income.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase text-slate-500">Ausgaben</p>
              <p className="mt-4 text-3xl font-bold">€{summary.expense.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase text-slate-500">Saldo</p>
              <p className="mt-4 text-3xl font-bold">€{summary.balance.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
