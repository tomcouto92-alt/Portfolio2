"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message
      );
    } else {
      router.push("/admin");
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#0A0A0A] text-[#F5F3EF] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <a
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-[#B8B8B8] hover:text-white transition-colors"
          >
            ← Volver al portfolio
          </a>
          <h1 className="text-4xl tracking-tight mt-6 mb-2">Admin</h1>
          <p className="text-[#B8B8B8] text-sm">Accedé para gestionar tus proyectos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/60"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-[#B8B8B8]/60"
          />

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#F5F3EF] text-black rounded-full text-sm font-medium hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 mt-2"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
