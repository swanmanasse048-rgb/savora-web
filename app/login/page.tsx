"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper pour traduire les erreurs courantes de Supabase Auth
  const getFrenchErrorMessage = (message: string) => {
    if (message.includes("Invalid login credentials")) {
      return "Email ou mot de passe incorrect.";
    }
    if (message.includes("Email not confirmed")) {
      return "Veuillez confirmer votre adresse email avant de vous connecter.";
    }
    return "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(getFrenchErrorMessage(error.message));
      setLoading(false);
      return;
    }

    router.push("/restaurants");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-3xl font-black text-[#800020]">
          Savora
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Connexion à votre compte
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Accédez à vos réservations et vos restaurants favoris.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#800020]/10 sm:px-10">
          
          {errorMsg && (
            <div 
              role="alert" 
              className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-2"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#800020] hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-10 text-gray-900 shadow-sm transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.19c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21f-9-9" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#800020] py-3.5 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Vous n'avez pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#800020] hover:underline"
            >
              S'inscrire
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}