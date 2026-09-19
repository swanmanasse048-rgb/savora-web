import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savora | Réservez les meilleurs restaurants",
  description:
    "Découvrez et réservez facilement dans les restaurants d'exception de votre ville avec Savora.",
};

export const revalidate = 0;

type RestaurantListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  image_url: string | null;
  category: string | null;
};

export default async function HomePage() {
  // Récupération des derniers restaurants approuvés pour la page d'accueil
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, address, image_url, category")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6); // Limité aux 6 derniers pour la page d'accueil

  const restaurantList = (restaurants || []) as RestaurantListItem[];

  return (
    <main className="min-h-screen bg-[#FAFAFA] selection:bg-[#800020] selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100 py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="inline-block rounded-full bg-[#800020]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#800020] mb-6">
            Bienvenue sur Savora
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl max-w-3xl mx-auto">
            Vivez des expériences culinaires d'exception
          </h1>
          <p className="mt-6 text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Trouvez les meilleures tables, consultez les menus et réservez votre instant gourmand en quelques clics.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/restaurants"
              className="inline-flex items-center justify-center rounded-2xl bg-[#800020] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#600018] shadow-sm"
            >
              Explorer les restaurants →
            </Link>
            <Link
              href="/partner/register"
              className="inline-flex items-center justify-center rounded-2xl bg-white border border-gray-200 px-8 py-4 text-sm font-semibold text-gray-700 transition hover:border-[#800020] hover:text-[#800020] shadow-sm"
            >
              Inscrire mon établissement
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION RESTAURANTS À LA UNE */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#800020] uppercase tracking-wider">Sélection</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              Restaurants à la une
            </h2>
          </div>
          <Link
            href="/restaurants"
            className="text-sm font-semibold text-[#800020] transition hover:opacity-80"
          >
            Voir tous les restaurants →
          </Link>
        </div>

        {restaurantList.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantList.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.slug || restaurant.id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#800020]/30 hover:shadow-xl"
              >
                {/* IMAGE */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                      <span className="text-3xl">🍽️</span>
                    </div>
                  )}

                  {/* CATÉGORIE */}
                  {restaurant.category && (
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                      {restaurant.category}
                    </span>
                  )}
                </div>

                {/* CONTENU */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#800020]">
                      {restaurant.name}
                    </h3>

                    {restaurant.address && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 font-light">
                        <span>📍</span>
                        <span className="truncate">{restaurant.address}</span>
                      </p>
                    )}

                    {restaurant.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600 font-light leading-relaxed">
                        {restaurant.description}
                      </p>
                    )}
                  </div>

                  {/* PIED DE CARTE */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ouvert
                    </span>

                    <span className="text-xs font-semibold text-[#800020] transition-transform group-hover:translate-x-1">
                      Découvrir →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020] text-2xl mb-4">
              🍽️
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Bientôt de nouveaux restaurants
            </h3>
            <p className="mt-2 text-sm text-gray-500 font-light">
              Nos partenaires finalisent leur installation. Revenez très vite !
            </p>
          </div>
        )}
      </section>

      {/* SECTION BANNIÈRE PARTENAIRE */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-[#800020] p-10 text-white shadow-md md:p-14">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Vous possédez un établissement ?
            </h2>
            <p className="mt-3 text-sm text-white/80 font-light leading-relaxed">
              Rejoignez le réseau Savora pour booster votre visibilité, gérer vos réservations facilement et accueillir une nouvelle clientèle.
            </p>
            <div className="mt-8">
              <Link
                href="/partner/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-[#800020] transition hover:bg-gray-100 shadow-sm"
              >
                Inscrire mon restaurant
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}