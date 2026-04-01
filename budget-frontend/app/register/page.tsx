"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { apiFetch, getErrorMessage, safeApiJson } from "../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await safeApiJson<{ detail?: unknown }>(response);
      if (response.ok) {
        setSuccess("Registrierung erfolgreich. Du wirst zur Startseite weitergeleitet.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/");
        return;
      }

      setError(
        getErrorMessage(data?.detail ?? data, `Registrierung fehlgeschlagen (${response.status})`)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Registrieren.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Registrieren</h1>

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

        <label className="block mb-4 text-sm font-medium text-slate-700">
          Passwort wiederholen
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Passwort wiederholen"
          />
        </label>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mb-4 text-sm text-green-600">{success}</p> : null}

        <button
          onClick={handleRegister}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
        >
          Registrieren
        </button>
      </div>
    </Layout>
  );
}
