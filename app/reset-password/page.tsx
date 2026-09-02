"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase va automatiquement capturer le jeton de la session dans l'URL
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Si aucune session n'est détectée (lien expiré ou invalide)
        setError("Le lien de réinitialisation est invalide ou a expiré.");
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
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
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        {success ? (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Mot de passe mis à jour !
            </h3>
            <p className="text-sm text-gray-600">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
            <Link
              href="/login"
              className="inline-block rounded-full bg-[#800020] px-6 py-2.5 text-sm font-semibold text-white mt-2"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-sm text-gray-900 transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#800020] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#600018] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}