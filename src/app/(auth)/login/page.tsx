"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "E-Mail oder Passwort ist falsch."
          : res.error
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo className="h-16 w-16" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white">
              SV WACKER BURGHAUSEN
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-wacker-red-light">
              eSports Team-Hub
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
          <h2 className="mb-6 text-center text-lg font-semibold text-white">Anmelden</h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="label" htmlFor="email">
              E-Mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@wacker-esports.de"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="label" htmlFor="password">
              Passwort
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Anmelden
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-ink-400">
          Noch keinen Zugang? Euer Manager kann einen unter „Admin/Manager → Kader" für dich anlegen.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
