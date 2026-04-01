import Link from "next/link";
import Layout from "./components/Layout";

export default function Home() {
  return (
    <Layout>
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-16 text-white shadow-2xl shadow-slate-900/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
              Bessere Finanzen beginnen hier
            </span>
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
              Plane deine Einnahmen und Ausgaben smarter.
            </h1>
            <p className="max-w-xl text-lg text-slate-200/90">
              Erstelle dein Budget, verfolge Transaktionen und behalte deine Finanzen im Überblick – alles an einem Ort.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-3xl border border-white/30 bg-transparent px-8 py-4 text-sm font-semibold text-white transition duration-300 ease-out hover:border-white hover:bg-white/10 hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Zur Anmeldung
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/70 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Budgetübersicht</p>
                <p className="mt-4 text-4xl font-semibold">€1.528,40</p>
                <p className="text-slate-300">Aktueller Saldo</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Einnahmen</p>
                  <p className="mt-2 text-2xl font-semibold">€3.200</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Ausgaben</p>
                  <p className="mt-2 text-2xl font-semibold">€1.672</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
