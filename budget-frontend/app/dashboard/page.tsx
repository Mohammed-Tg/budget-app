"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, safeApiJson } from "../lib/api";
import { useProtectedRoute } from "../lib/auth";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

const chartColors = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#60a5fa", "#c084fc", "#34d399"];

export default function DashboardPage() {
  const { authorized, checking } = useProtectedRoute();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);

  useEffect(() => {
    if (!authorized) return;

    setLoading(true);
    setError(null);

    apiFetch("/transactions/")
      .then(async (res) => {
        const data = await safeApiJson<Transaction[]>(res);

        if (!res.ok) {
          throw new Error("Transaktionen konnten nicht geladen werden.");
        }

        if (!data) {
          throw new Error("Transaktionsdaten sind ungültig.");
        }

        setTransactions(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authorized]);

  const incomeTotal = useMemo(
    () => transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const expenseTotal = useMemo(
    () => transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const balance = incomeTotal - expenseTotal;

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const incomeExpenseData = useMemo(
    () => [
      { name: "Einnahmen", value: incomeTotal },
      { name: "Ausgaben", value: expenseTotal },
    ],
    [incomeTotal, expenseTotal]
  );

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
      <div className="space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Übersicht</h1>
              <p className="mt-2 text-slate-600">Hier sehen Sie Ihre aktuellen Einnahmen, Ausgaben und den Kontostand.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-emerald-700">Einnahmen</p>
                <p className="mt-4 text-3xl font-semibold text-emerald-900">{formatCurrency(incomeTotal)}</p>
              </div>
              <div className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-red-700">Ausgaben</p>
                <p className="mt-4 text-3xl font-semibold text-red-900">{formatCurrency(expenseTotal)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Saldo</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(balance)}</p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl bg-rose-50 p-6 text-rose-800 shadow-sm">{error}</div>
        ) : loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-lg">Wird geladen...</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Ausgaben nach Kategorie</h2>
                  <p className="text-sm text-slate-500">Ein visueller Überblick über Ihre größten Ausgabengruppen.</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Einnahmen vs. Ausgaben</h2>
                  <p className="text-sm text-slate-500">Vergleich der Monatswerte auf einen Blick.</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="value" fill="#2563eb" radius={[12, 12, 0, 0]}>
                      {incomeExpenseData.map((entry) => (
                        <Cell key={entry.name} fill={entry.name === "Einnahmen" ? "#2563eb" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
