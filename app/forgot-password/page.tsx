"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    // L'URL vers laquelle Supabase redirigera l'utilisateur après avoir cliqué sur le lien dans l'e-mail
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage(
        "Un e-mail de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception (et vos spams)."
      );
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[#800020]"
          >
            SAVORA
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#800020] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#600018] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[#800020] hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}