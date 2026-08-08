"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-brand-white mb-2 text-center">Admin</h1>
        <p className="text-brand-muted text-sm text-center mb-8">Sign in to manage IkeBlendz</p>

        <div className="space-y-4">
          <div>
            <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-brand-muted text-xs tracking-wider uppercase mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-charcoal border border-white/10 text-brand-white px-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-3.5 bg-brand-gold text-brand-black font-semibold text-sm tracking-widest uppercase hover:bg-brand-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
