import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Restaurants Partenaires | Savora",
  description:
    "Découvrez la liste des meilleurs restaurants disponibles sur Savora et trouvez votre prochaine expérience culinaire.",
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

export default async function RestaurantsPage() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, address, image_url, category")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-[#800020]">Restaurants</h1>
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-semibold">Une erreur est survenue lors du chargement :</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const restaurantList = (restaurants || []) as RestaurantListItem[];

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* HERO / HEADER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#800020] via-[#5c0017] to-[#400010] py-20 text-white">
        {/* Cercles décoratifs en arrière-plan */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
              ✨ Expérience Culinaire Exclusive
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Nos Restaurants Partenaires
            </h1>

            <p className="mt-4 text-lg leading-8 text-rose-100/90">
              Explorez une sélection raffinée d'établissements gourmands, consultez leurs cartes et réservez votre table en quelques clics.
            </p>

            {/* Badges de stats rapides */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-amber-400">🍽️</span>
                <span>{restaurantList.length} Établissement{restaurantList.length > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-emerald-400">⚡</span>
                <span>Réservation instantanée</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PRINCIPALE (LISTE & CARTE) */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {/* COMPTEUR DE RÉSULTATS */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-200/80 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tous les établissements</h2>
            <p className="text-sm text-gray-500">
              Trouvez l'endroit idéal pour votre prochain repas
            </p>
          </div>
          <span className="rounded-full bg-[#800020]/10 px-3.5 py-1 text-xs font-bold text-[#800020]">
            {restaurantList.length} résultat{restaurantList.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* GRILLE DES RESTAURANTS */}
        {restaurantList.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantList.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#800020]/20 hover:shadow-2xl"
              >
                {/* BLOC IMAGE */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}

                  {/* OVERLAY DEGRADE */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                  {/* BADGE CATEGORIE */}
                  {restaurant.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow-md backdrop-blur-md">
                      {restaurant.category}
                    </span>
                  )}
                </div>

                {/* CONTENU INFO */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-[#800020]">
                      {restaurant.name}
                    </h3>

                    {restaurant.address && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <span className="text-xs">📍</span>
                        <span className="truncate">{restaurant.address}</span>
                      </p>
                    )}

                    {restaurant.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {restaurant.description}
                      </p>
                    )}
                  </div>

                  {/* PIED DE CARTE / BOUTON */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Disponible
                    </span>

                    <div className="flex items-center gap-1 text-sm font-bold text-[#800020] transition-transform group-hover:translate-x-1">
                      <span>Voir la fiche</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* STATE VIDE */
          <div className="my-12 rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#800020]/5 text-4xl">
              🍽️
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              Aucun restaurant partenaire
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Les établissements partenaires enregistrés sur Savora s'afficheront directement ici dès leur validation.
            </p>
          </div>
        )}
      </section>

      {/* SECTION CTA - APPEL AUX RESTAURATEURS */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#800020] to-[#4a0013] p-10 text-white shadow-xl md:p-16">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black md:text-4xl">
              Vous possédez un établissement ?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-rose-100/90">
              Rejoignez le réseau Savora pour booster votre visibilité, gérer vos réservations facilement et accueillir une nouvelle clientèle.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/partner/register"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#800020] shadow-lg transition duration-300 hover:bg-rose-50 hover:shadow-xl hover:scale-105"
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