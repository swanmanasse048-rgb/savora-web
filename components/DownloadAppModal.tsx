"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Réinitialisation de l'état quand la modale s'ouvre/se ferme
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        setErrorMessage(null);
        setPlatform("ios");
      }, 200);
    }
  }, [isOpen]);

  // Fermeture de la modale avec la touche Échap (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.from("app_waitlist").insert([
        { email, platform, created_at: new Date().toISOString() }
      ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Erreur lors de l'inscription:", err);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP FLOUTÉ AVEC FONDU */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" 
      />

      {/* CONTENEUR DE LA MODALE */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 md:p-8 shadow-2xl ring-1 ring-black/5 transition-all animate-in zoom-in-95 duration-200 z-10">
        
        {/* BOUTON FERMER */}
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 active:scale-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          /* ÉTAT DE SUCCÈS */
          <div className="py-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <svg className="h-10 w-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="mt-6 text-2xl font-black tracking-tight text-gray-900">
              Vous êtes sur la liste !
            </h3>
            
            <p className="mt-2 text-sm leading-relaxed text-gray-600 max-w-sm mx-auto">
              Merci pour votre confiance. Nous vous enverrons un lien d'accès prioritaire dès que l'application <span className="font-semibold text-[#800020]">Savora</span> sera disponible sur l'
              {platform === "ios" ? "App Store" : "Google Play Store"}.
            </p>

            <button
              onClick={onClose}
              className="mt-8 w-full rounded-full bg-[#800020] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#800020]/20 transition-all hover:bg-[#600018] active:scale-[0.98]"
            >
              Compris !
            </button>
          </div>
        ) : (
          /* FORMULAIRE PRINCIPAL */
          <div>
            {/* EN-TÊTE ET BADGE */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-bold text-[#800020]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#800020] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#800020]"></span>
                </span>
                Bientôt disponible
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-gray-900">
              L'expérience Savora sur votre smartphone
            </h3>
            
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              Inscrivez-vous pour bénéficier d'un accès anticipé et d'avantages exclusifs lors du lancement.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* SÉLECTEUR DE PLATEFORME */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Choisissez votre OS
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlatform("ios")}
                    className={`relative flex items-center justify-center gap-2.5 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                      platform === "ios"
                        ? "border-[#800020] bg-[#800020]/5 text-[#800020] shadow-sm ring-1 ring-[#800020]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.65-.79 1.1-1.88.98-2.98-.95.04-2.1.63-2.78 1.43-.61.71-1.14 1.83-1 2.93 1.07.08 2.15-.59 2.8-1.38z"/>
                    </svg>
                    iOS (iPhone)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform("android")}
                    className={`relative flex items-center justify-center gap-2.5 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                      platform === "android"
                        ? "border-[#800020] bg-[#800020]/5 text-[#800020] shadow-sm ring-1 ring-[#800020]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.551 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997 0-.551.4482-.9993.9993-.9993.551 0 .9993.4483.9993.9993 0 .5511-.4482.9997-.9993.9997m11.3323-6.521l1.8336-3.176c.0991-.1714.0402-.3903-.1313-.4894-.1714-.0991-.3903-.0402-.4894.1313l-1.8624 3.226C15.5458 7.728 13.8291 7.288 12 7.288c-1.8291 0-3.5458.44-5.1596 1.2243L4.978 5.2863c-.0991-.1715-.318-.2304-.4894-.1313-.1715.0991-.2304.318-.1313.4894l1.8336 3.176C2.8687 10.4287.644 13.5658.1882 17.288h23.6236c-.4558-3.7222-2.6805-6.8593-6.0025-8.4676"/>
                    </svg>
                    Android
                  </button>
                </div>
              </div>

              {/* CHAMP D'EMAIL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Votre adresse e-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-gray-900 transition focus:border-[#800020] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#800020]/10 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* ERREUR EVENTUELLE */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {/* BOUTON D'ENVOI */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-[#800020] py-4 text-sm font-bold text-white shadow-lg shadow-[#800020]/25 transition-all hover:bg-[#600018] hover:shadow-xl hover:shadow-[#800020]/30 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  <>
                    <span>Rejoindre la liste d'attente</span>
                    <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}