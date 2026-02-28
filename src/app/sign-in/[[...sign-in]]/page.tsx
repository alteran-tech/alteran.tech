"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error ?? "Ошибка авторизации");
      }
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center -mt-8 px-4">
      <div className="relative w-full max-w-md">
        {/* Decorative glow behind the panel */}
        <div
          className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(113, 215, 180, 0.2), transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Glass panel wrapper */}
        <div className="glass-panel glow-box-subtle relative p-6 sm:p-10">
          {/* Alteran decorative header */}
          <div className="mb-8 text-center">
            <p className="font-alteran text-2xl tracking-widest text-ancient-teal glow-text-subtle">
              alteran
            </p>
            <p className="mt-1 text-sm text-ancient-aqua/70">
              Требуется авторизация
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-ancient-aqua/70 mb-1.5"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-base)] placeholder-ancient-aqua/30 focus:outline-none focus:border-ancient-teal/60 input-focus-glow transition-all"
                placeholder="Введите пароль"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-ancient-teal text-ancient-bg font-medium text-sm hover:bg-ancient-teal/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal"
            >
              {loading ? "Вход…" : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
