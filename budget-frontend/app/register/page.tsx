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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);

    try {
      const registerResponse = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!registerResponse.ok) {
        const registerData = await safeApiJson(registerResponse);
        throw new Error(
          getErrorMessage(registerData ?? registerResponse.error?.message, `Registrierung fehlgeschlagen (${registerResponse.status})`)
        );
      }

      const loginResponse = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const loginData = await safeApiJson<{ access_token?: string; detail?: unknown }>(loginResponse);
      if (!loginResponse.ok || !loginData?.access_token) {
        throw new Error(
          getErrorMessage(loginData?.detail ?? loginData ?? loginResponse.error?.message, `Login fehlgeschlagen (${loginResponse.status})`)
        );
      }

      localStorage.setItem("token", loginData.access_token);
      window.dispatchEvent(new Event("authchange"));
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Netzwerkfehler beim Registrieren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Registrieren</h1>

        <form onSubmit={handleRegister}>
          <label className="block mb-3 text-sm font-medium text-slate-700">
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              placeholder="deine@email.de"
              required
              disabled={loading}
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
              required
              disabled={loading}
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
              required
              disabled={loading}
            />
          </label>

          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Registriere..." : "Registrieren"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
