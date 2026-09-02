"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ContactPartenairePage() {
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Insertion de la demande de partenariat dans Supabase
      const { error } = await supabase.from("partner_requests").insert([
        {
          restaurant_name: formData.restaurantName,
          owner_name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          category: formData.category,
          message: formData.message,
          status: "pending",
        },
      ]);

      if (error) {
        // Si la table 'partner_requests' n'existe pas encore, gestion du repli
        console.error("Erreur Supabase:", error);
        setErrorMessage(
          "Une erreur est survenue lors de l'envoi. Veuillez réessayer."
        );
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMessage("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#800020]/5 via-white to-white py-12 md:py-20 text-gray-900">
      <div className="mx-auto max-w-3xl px-6">
        
        {/* EN-TÊTE */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-[#800020]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#800020]">
            Espace Restaurateurs
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Devenez partenaire Savora
          </h1>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            Rejoignez notre réseau, développez votre visibilité et recevez vos premières réservations en ligne.
          </p>
        </div>

        {/* ÉTAT SUCCÈS */}
        {submitted ? (
          <div className="mt-12 rounded-3xl border border-[#800020]/20 bg-[#800020]/5 p-8 text-center shadow-lg md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#800020] text-3xl text-white">
              🍷
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Demande envoyée avec succès !
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Merci de votre intérêt pour Savora. Notre équipe étudiera votre dossier et vous recontactera sous 24 à 48 heures pour finaliser votre inscription.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-full bg-[#800020] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018]"
            >
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          /* FORMULAIRE DE CONTACT */
          <form
            onSubmit={handleSubmit}
            className="mt-12 space-y-6 rounded-3xl border border-[#800020]/15 bg-white p-8 shadow-xl md:p-10"
          >
            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Nom du restaurant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  required
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Le Petit Bistro"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              {/* Nom du propriétaire / gérant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom & Prénom du responsable *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email professionnelle *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@restaurant.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Adresse du restaurant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse du restaurant *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="12 rue Gastronomique, Paris"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de cuisine / Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Gastronomique">Gastronomique</option>
                  <option value="Bistrot / Brasserie">Bistrot / Brasserie</option>
                  <option value="Italien">Italien</option>
                  <option value="Asiatique">Asiatique</option>
                  <option value="Fast Good / Burger">Fast Good / Burger</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Message libre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message / Précisions (facultatif)
              </label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Présentez brièvement votre établissement ou vos besoins..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
              />
            </div>

            {/* BOUTON SOUMISSION */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#800020] py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#600018] hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Envoi de la demande..." : "Envoyer ma demande de partenariat"}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}