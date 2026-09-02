"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import DownloadAppModal from "./DownloadAppModal";

interface MenuItem {
  id: string;
  label: string;
  menu_url: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [dbNavLinks, setDbNavLinks] = useState<MenuItem[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("menu_urls")
        .select("id, label, menu_url");

      if (!error && data) {
        setDbNavLinks(data);
      }
    };

    fetchMenus();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const staticNavLinks = [
    { href: "/", label: "Accueil" },
    { href: "/restaurants", label: "Restaurants" },
    { href: "/about", label: "À propos" },
  ];

  const formattedDbLinks = dbNavLinks.map((item) => ({
    href: item.menu_url,
    label: item.label,
  }));

  const allNavLinks = [...staticNavLinks, ...formattedDbLinks];

  if (user) {
    allNavLinks.push({ href: "/reservations", label: "Mes Réservations" });
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#800020]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[#800020] transition hover:opacity-90"
          >
            SAVORA
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {allNavLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={`${link.href}-${index}`}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? "font-semibold text-[#800020]"
                      : "text-gray-700 hover:text-[#800020]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <button
                onClick={handleSignOut}
                className="rounded-full border border-[#800020]/20 px-5 py-2.5 text-sm font-semibold text-[#800020] transition hover:bg-[#800020]/5"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-[#800020] px-5 py-2.5 text-sm font-semibold text-[#800020] transition hover:bg-[#800020] hover:text-white"
              >
                Se connecter
              </Link>
            )}

            <button
              onClick={() => setIsAppModalOpen(true)}
              className="rounded-full bg-[#800020] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#600018] hover:scale-[1.02] active:scale-[0.98]"
            >
              Télécharger l'app
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-b border-[#800020]/10 bg-white px-6 pb-6 pt-2 md:hidden">
            <nav className="flex flex-col gap-4">
              {allNavLinks.map((link, index) => (
                <Link
                  key={`${link.href}-${index}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition ${
                    pathname === link.href
                      ? "font-bold text-[#800020]"
                      : "text-gray-700 hover:text-[#800020]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-2 border-gray-100" />

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-full border border-[#800020]/20 py-3 text-center text-sm font-semibold text-[#800020]"
                >
                  Déconnexion
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full border border-[#800020] py-3 text-center text-sm font-semibold text-[#800020]"
                >
                  Se connecter
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAppModalOpen(true);
                }}
                className="w-full rounded-full bg-[#800020] py-3 text-center text-sm font-semibold text-white shadow-sm"
              >
                Télécharger l'app
              </button>
            </nav>
          </div>
        )}
      </header>

      <DownloadAppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </>
  );
}