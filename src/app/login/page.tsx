"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";

export default function LoginPage() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dreams`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  return (
    <main className="view-in mx-auto flex min-h-dvh max-w-[480px] flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-9">
        <h1 className="font-hand text-[2.6rem] leading-none text-ink">dream</h1>
        <p className="mt-3 font-serif text-[0.95rem] text-ink-soft">
          자다 깬 꿈을, 흘려보내지 않도록.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className="rounded-full border border-line bg-card px-6 py-3 text-sm text-ink transition hover:border-blue disabled:opacity-50"
        >
          {loading === "google" ? "연결 중…" : "Google로 계속하기"}
        </button>
        <button
          onClick={() => signIn("apple")}
          disabled={loading !== null}
          className="rounded-full border border-line bg-card px-6 py-3 text-sm text-ink transition hover:border-blue disabled:opacity-50"
        >
          {loading === "apple" ? "연결 중…" : "Apple로 계속하기"}
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-blue-deep">{error}</p>}
    </main>
  );
}
