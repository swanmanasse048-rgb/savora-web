"use client";

import { useState } from "react";
import Link from "next/link";
import DownloadAppModal from "@/components/DownloadAppModal";

export default function Footer() {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-[#800020]/15 bg-white text-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
          
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
            
            {/* BRANDING / PRÉSENTATION */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="inline-block text-2xl font-black text-[#800020]">
                Savora.
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed">
                La plateforme moderne pour découvrir les meilleures tables et réserver en toute simplicité.
              </p>
              <div className="text-xs text-gray-400">
                © {new Date().getFullYear()} Savora. Tous droits réservés.
              </div>
            </div>

            {/* NAVIGATION CLIENTS */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
                Découvrir
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-gray-600">
                <li>
                  <Link href="/restaurants" className="transition hover:text-[#800020]">
                    Tous les restaurants
                  </Link>
                </li>
                <li>
                  <Link href="/reservations" className="transition hover:text-[#800020]">
                    Mes réservations
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="transition hover:text-[#800020]">
                    À propos de nous
                  </Link>
                </li>
              </ul>
            </div>

            {/* PROFESSIONNELS / PARTENAIRES */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
                Restaurateurs
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-gray-600">
                <li>
                  <Link href="/contact-partenaire" className="transition hover:text-[#800020]">
                    Devenir partenaire
                  </Link>
                </li>
                <li>
                  <Link href="/contact-partenaire" className="transition hover:text-[#800020]">
                    Espace Etablissements
                  </Link>
                </li>
              </ul>
            </div>

            {/* APPLICATION MOBILE */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800020]">
                Application
              </h3>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                Emportez Savora dans votre poche pour réserver vos tables à tout moment.
              </p>
              <button
                onClick={() => setIsAppModalOpen(true)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#600018] active:scale-95"
              >
                📱 Télécharger l'application
              </button>
            </div>

          </div>

          {/* MENTIONS LÉGALES / BASE FOOTER */}
          <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-900 transition">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition">
                Conditions d'utilisation
              </Link>
              <Link href="/contact" className="hover:text-gray-900 transition">
                Contact
              </Link>
            </div>
            <p>Conçu pour une expérience culinaire d'exception.</p>
          </div>

        </div>
      </footer>

      {/* MODALE TÉLÉCHARGEMENT APP */}
      <DownloadAppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </>
  );
}