"use client";

import { useState } from "react";
import { AdminButton, TextInput } from "../ui";
import { LogoMark } from "@/components/ui/Logo";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-requested-with": "zee99-admin" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-6">
      <form onSubmit={submit} className="w-full max-w-sm border border-ink/15 bg-white/40 p-8">
        <div className="mb-8 flex flex-col items-center">
          <LogoMark className="h-10 w-10" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-ink">
            Zee99 · Admin
          </p>
        </div>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2">
            Password
          </span>
          <TextInput
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="mt-3 text-[12px] text-red-900">{error}</p>}
        <AdminButton type="submit" busy={busy} className="mt-6 w-full justify-center">
          Sign in
        </AdminButton>
      </form>
    </div>
  );
}
