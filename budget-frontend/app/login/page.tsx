"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { apiFetch, getErrorMessage, safeApiJson } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await safeApiJson<{ access_token?: string; detail?: unknown }>(response);

      if (response.ok && data?.access_token) {
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
        return;
      }

      setError(getErrorMessage(data?.detail ?? data, `Anmeldung fehlgeschlagen (${response.status})`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Einloggen.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Anmelden</h1>

        <label className="block mb-3 text-sm font-medium text-slate-700">
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            placeholder="deine@email.de"
          />
        </label>

        <label className="block mb-3 text-sm font-medium text-slate-700">
          Passwort
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Passwort"
          />
        </label>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <button
          onClick={handleLogin}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
        >
          Anmelden
        </button>
      </div>
    </Layout>
  );
}