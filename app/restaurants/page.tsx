import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tous les Restaurants | Savora",
  description: "Explorez notre répertoire complet de restaurants et réservez votre table.",
};

export const revalidate = 0;

export default async function RestaurantsPage() {
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, address, image_url, category")
    .eq("status", "approved")
    .order("name", { ascending: true });

  const restaurantList = restaurants || [];

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-semibold text-[#800020] uppercase tracking-wider">Annuaire</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Tous nos restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">Trouvez l'endroit idéal pour vos déjeuners et dîners.</p>
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
                    <span className="text-xs font-semibold text-[#800020]">Voir la table →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">Aucun restaurant disponible</h3>
            <p className="mt-2 text-sm text-gray-500">Revenez un peu plus tard.</p>
          </div>
        )}
      </div>
    </main>
  );
}