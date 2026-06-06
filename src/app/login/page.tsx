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
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-10">
        <div className="mx-auto mb-8 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_38%_35%,#fff8e6,#f0e4c0_45%,#cdbf94_75%,#b3a47e)] shadow-[0_0_50px_10px_rgba(243,236,216,0.3)]" />
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
          꿈 아카이브
        </h1>
        <p className="mt-3 font-serif text-muted">
          자다 깬 꿈을, 흘려보내지 않도록.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className="rounded-full border border-line bg-card px-6 py-3 text-foreground backdrop-blur transition hover:border-accent disabled:opacity-50"
        >
          {loading === "google" ? "연결 중…" : "Google로 계속하기"}
        </button>
        <button
          onClick={() => signIn("apple")}
          disabled={loading !== null}
          className="rounded-full border border-line bg-card px-6 py-3 text-foreground backdrop-blur transition hover:border-accent disabled:opacity-50"
        >
          {loading === "apple" ? "연결 중…" : "Apple로 계속하기"}
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-rose-300">{error}</p>}
    </main>
  );
}
