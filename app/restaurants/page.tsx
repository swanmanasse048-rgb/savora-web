import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default async function RestaurantsPage() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select(
      "*"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-[#800020]">
            Restaurants
          </h1>

          <div className="mt-8 rounded-2xl bg-red-50 p-6 text-red-600 border border-red-100">
            Erreur : {error.message}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <section className="border-b border-[#800020]/10 bg-[#800020]/5">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <p className="text-sm font-semibold uppercase tracking-widest text-[#800020]">
            Savora
          </p>

          <h1 className="mt-3 text-4xl font-black text-gray-900 md:text-6xl">
            Restaurants
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Découvrez les restaurants disponibles sur Savora
            et trouvez votre prochaine expérience.
          </p>

        </div>
      </section>

      {/* LISTE */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-8 flex items-center justify-between">
          <p className="text-gray-500 font-medium">
            {restaurants?.length || 0} restaurant
            {restaurants?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {restaurants && restaurants.length > 0 ? (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {restaurants.map((restaurant) => (

              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.slug}`}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#800020]/20 hover:shadow-xl"
              >

                {/* IMAGE */}
                <div className="relative h-64 overflow-hidden bg-gray-100">

                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}

                  {restaurant.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 backdrop-blur shadow-sm">
                      {restaurant.category}
                    </span>
                  )}

                </div>

                {/* INFOS */}
                <div className="p-6">

                  <h2 className="text-xl font-bold text-gray-900 transition group-hover:text-[#800020]">
                    {restaurant.name}
                  </h2>

                  {restaurant.address && (
                    <p className="mt-2 text-sm text-gray-500">
                      📍 {restaurant.address}
                    </p>
                  )}

                  {restaurant.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="mt-5 font-semibold text-[#800020] transition group-hover:translate-x-1">
                    Découvrir →
                  </div>

                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="rounded-3xl border border-dashed border-[#800020]/20 bg-[#800020]/5 p-12 text-center">

            <div className="text-5xl">
              🍽️
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Aucun restaurant pour le moment
            </h2>

            <p className="mt-3 text-gray-500">
              Les restaurants partenaires de Savora
              apparaîtront ici.
            </p>

          </div>

        )}

      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#800020] to-[#500014] text-white">

        <div className="mx-auto max-w-4xl px-6 py-20 text-center">

          <h2 className="text-3xl font-black md:text-4xl">
            Vous êtes un restaurant ?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Rejoignez Savora et permettez à vos clients
            de découvrir votre établissement.
          </p>

        </div>

      </section>

    </main>
  );
}