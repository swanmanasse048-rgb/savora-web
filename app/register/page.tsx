"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Traduction des erreurs courantes Supabase
  const getFrenchErrorMessage = (message: string) => {
    if (message.includes("User already registered")) {
      return "Un compte existe déjà avec cette adresse email.";
    }
    if (message.includes("Password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    return "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(getFrenchErrorMessage(error.message));
      setLoading(false);
      return;
    }

    // Si la confirmation par email est requise
    if (data.user && !data.session) {
      setSuccessMsg(
        "Votre compte a été créé avec succès ! Veuillez vérifier votre boîte email pour valider votre inscription."
      );
      setLoading(false);
      return;
    }

    // Si l'inscription connecte directement l'utilisateur
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
          Créer votre compte
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Découvrez et réservez les meilleures tables en quelques clics.
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

          {successMsg ? (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
                <div className="text-4xl mb-3" aria-hidden="true">✉️</div>
                <h2 className="text-base font-bold text-emerald-900">Vérifiez vos emails</h2>
                <p className="mt-2 text-sm text-emerald-700 leading-relaxed">
                  {successMsg}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block w-full rounded-full bg-[#800020] py-3.5 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018]"
              >
                Aller à la page de connexion
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom complet
                </label>
                <div className="mt-2">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  />
                </div>
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm transition focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Au moins 6 caractères requises.
                </p>
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
                    <span>Création en cours...</span>
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>
          )}

          {!successMsg && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#800020] hover:underline"
              >
                Se connecter
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}