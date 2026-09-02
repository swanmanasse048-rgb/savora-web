import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar"; // <-- Importation du composant Navbar
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Savora - Réservez votre table de restaurant",
    template: "%s | Savora",
  },
  description:
    "Découvrez les meilleures adresses gourmandes et réservez votre table en quelques clics.",
  keywords: ["restaurant", "réservation", "gastronomie", "tables", "savora"],
  authors: [{ name: "Savora" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Savora - Réservez votre table de restaurant",
    description: "Découvrez et réservez les meilleurs restaurants près de chez vous.",
    url: "https://savora.app",
    siteName: "Savora",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Savora - Réservez votre table",
    description: "Découvrez et réservez les meilleurs restaurants.",
  },
};

export const viewport: Viewport = {
  themeColor: "#800020",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-[#800020] selection:text-white flex flex-col">
        {/* Affichage de la Navbar globale */}
        <Navbar />

        {/* Contenu de chaque page */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}