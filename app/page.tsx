import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savora | Réservez les meilleurs restaurants",
  description: "Découvrez et réservez facilement dans les restaurants d'exception de votre ville avec Savora.",
};

export const revalidate = 0;

export default async function HomePage() {
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, address, image_url, category")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  const restaurantList = restaurants || [];

  return (
    <main className="min-h-screen bg-[#FAFAFA] selection:bg-[#800020] selection:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100 py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="inline-block rounded-full bg-[#800020]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#800020] mb-6">
            Bienvenue sur Savora
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl max-w-3xl mx-auto">
            Vivez des expériences culinaires d'exception
          </h1>
          <p className="mt-6 text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Trouvez les meilleures tables et réservez votre instant gourmand en quelques clics.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/restaurants"
              className="inline-flex items-center justify-center rounded-2xl bg-[#800020] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#600018] shadow-sm"
            >
              Explorer les restaurants →
            </Link>
          </div>
        </div>
      </section>

      {/* LISTING DES RESTAURANTS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-[#800020] uppercase tracking-wider">Sélection</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">Restaurants à la une</h2>
          </div>
          <Link href="/restaurants" className="text-sm font-semibold text-[#800020] transition hover:opacity-80">
            Voir tout →
          </Link>
        </div>

        {restaurantList.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantList.map((restaurant: any) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.slug || restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">🍽️</div>
                  )}
                  {restaurant.category && (
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                      {restaurant.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#800020] transition-colors">
                      {restaurant.name}
                    </h3>
                    {restaurant.address && (
                      <p className="mt-1 text-xs text-gray-500 truncate">📍 {restaurant.address}</p>
                    )}
                    {restaurant.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600 font-light">{restaurant.description}</p>
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-medium text-emerald-600">● Ouvert</span>
                    <span className="text-xs font-semibold text-[#800020]">Découvrir →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Bientôt de nouveaux restaurants</h3>
            <p className="mt-2 text-sm text-gray-500">Nos partenaires finalisent leur installation.</p>
          </div>
        )}
      </section>
    </main>
  );
}