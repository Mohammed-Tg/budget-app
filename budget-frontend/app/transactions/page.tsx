"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getErrorMessage, safeApiJson } from "../lib/api";
import { useProtectedRoute } from "../lib/auth";
import { CATEGORY_MAP } from "../lib/categories";

type TransactionType = "income" | "expense";

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export default function Transactions() {
  const { authorized, checking } = useProtectedRoute();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_MAP.expense[0]);
  const [type, setType] = useState<TransactionType>("expense");
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      const response = await apiFetch("/transactions/");
      const data = await safeApiJson<Transaction[]>(response);

      if (!response.ok) {
        setError(getErrorMessage(data ?? "Transaktionen konnten nicht geladen werden."));
        return;
      }

      setTxs(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Laden der Transaktionen.");
    }
  };

  useEffect(() => {
    if (!authorized) return;

    loadTransactions();
  }, [authorized]);

  useEffect(() => {
    setCategory(CATEGORY_MAP[type][0]);
  }, [type]);

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

  const handleCreate = async () => {
    setError(null);

     const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    setError("Bitte einen gültigen Betrag eingeben.");
    return;
  }


    if (!category) {
      setError("Kategorie ist erforderlich.");
      return;
    }

    try {
      const response = await apiFetch("/transactions/", {
        method: "POST",
        body: JSON.stringify({
          amount: numericAmount,
          type,
          category,
        }),
      });

      const data = await safeApiJson<{ detail?: unknown }>(response);
      if (!response.ok) {
        setError(getErrorMessage(data?.detail ?? data, "Konnte Transaktion nicht erstellen."));
        return;
      }

      setAmount("");
      setType("expense");
      setCategory(CATEGORY_MAP.expense[0]);
      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Erstellen der Transaktion.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      const data = await safeApiJson<{ detail?: string }>(response);

      if (!response.ok) {
        setError(data?.detail || "Konnte Transaktion nicht löschen.");
        return;
      }

      loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Löschen der Transaktion.");
    }
  };

  return (
    <Layout>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold mb-4">Transaktionen</h1>
          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          <div className="space-y-4">
            {txs.map((tx) => (
              <div key={tx.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{tx.category}</p>
                    <p className="text-sm text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">€{tx.amount.toFixed(2)}</p>
                    <p className="text-sm text-slate-500">
                      {tx.type === "income" ? "Einnahme" : "Ausgabe"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="mt-3 rounded-xl bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Neue Transaktion</h2>

          <label className="block mb-3 text-sm font-medium text-slate-700">
            Betrag
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              placeholder="z. B. 19.99"
            />
          </label>

          <label className="block mb-3 text-sm font-medium text-slate-700">
            Typ
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="expense">Ausgabe</option>
              <option value="income">Einnahme</option>
            </select>
          </label>

          <label className="block mb-3 text-sm font-medium text-slate-700">
            Kategorie
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            >
              {CATEGORY_MAP[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleCreate}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
          >
            Transaktion hinzufügen
          </button>
        </section>
      </div>
    </Layout>
  );
}