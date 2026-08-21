"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    setError(null);
    const { error } = await signInWithPassword(email, password);
    setSigningIn(false);
    // On success, AppShell's own effect redirects away from /login once `user` updates.
    if (error) setError(error);
  }

  return (
    <div className="mx-auto flex h-full max-w-sm flex-col justify-center space-y-4 p-4 text-center sm:p-6">
      <h1 className="font-serif text-xl font-semibold">MRCPsych Paper B</h1>
      <p className="text-sm text-muted-foreground">Sign in to access the study guides, quizzes, and tracker.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={signingIn}>
          {signingIn ? "Signing in…" : "Sign in"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
