import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function Home() {
  // Récupération UNIQUEMENT des restaurants approuvés
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, description, image_url, address, category")
    .eq("status", "approved")
    .limit(6);

  if (error) {
    console.error("Erreur lors de la récupération des restaurants:", error.message);
  }

  // =========================================================
  // RÉCUPÉRATION DES AVIS
  // =========================================================
  const restaurantIds = restaurants?.map((restaurant) => restaurant.id) || [];

  let reviews: {
    restaurant_id: string;
    rating: number;
  }[] = [];

  if (restaurantIds.length > 0) {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("restaurant_id, rating")
      .in("restaurant_id", restaurantIds);

    if (reviewsError) {
      console.error("Erreur lors de la récupération des avis:", reviewsError.message);
    } else {
      reviews = reviewsData || [];
    }
  }

  // =========================================================
  // CALCUL DES NOTES MOYENNES
  // =========================================================
  const ratingsByRestaurant: Record<
    string,
    {
      average: number;
      count: number;
    }
  > = {};

  reviews.forEach((review) => {
    if (!ratingsByRestaurant[review.restaurant_id]) {
      ratingsByRestaurant[review.restaurant_id] = {
        average: 0,
        count: 0,
      };
    }

    ratingsByRestaurant[review.restaurant_id].average += Number(review.rating);
    ratingsByRestaurant[review.restaurant_id].count += 1;
  });

  Object.keys(ratingsByRestaurant).forEach((restaurantId) => {
    const data = ratingsByRestaurant[restaurantId];
    data.average = data.average / data.count;
  });

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-[#800020] selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#800020] via-[#65001a] to-[#500014] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm text-white/90">
              <span>✨</span>
              Expérience culinaire d'exception
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight md:text-6xl lg:text-7xl">
              Découvrez. <br />
              Réservez. <br />
              <span className="text-amber-300">Savourez.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/80 font-light">
              Trouvez les meilleures tables autour de vous et planifiez vos moments gourmands en quelques clics sur Savora.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/restaurants"
                className="rounded-full bg-white px-8 py-4 text-sm font-bold text-[#800020] shadow-lg transition duration-300 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
              >
                Explorer les restaurants
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANTS POPULAIRES */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#800020]">
              À la une
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Restaurants populaires
            </h2>
          </div>

          <Link
            href="/restaurants"
            className="hidden items-center gap-1.5 text-sm font-semibold text-[#800020] transition hover:opacity-80 md:inline-flex"
          >
            Voir tout l'annuaire →
          </Link>
        </div>

        {/* CARTES RESTAURANTS */}
        {!restaurants || restaurants.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020] text-xl mb-3">
              🍽️
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Aucun restaurant approuvé disponible pour le moment.
            </p>
            <p className="mt-1 text-xs text-gray-400 font-light">
              Revenez bientôt pour découvrir de nouvelles adresses.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => {
              const rating = ratingsByRestaurant[restaurant.id];
              // Utilisation propre du slug en priorité, sinon repli sur l'ID
              const targetSlug = restaurant.slug
                ? restaurant.slug.toLowerCase().trim().replace(/\s+/g, '-')
                : restaurant.id;

              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${targetSlug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#800020]/30 hover:shadow-md"
                >
                  {/* IMAGE */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    {restaurant.image_url ? (
                      <Image
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-50 text-xs font-medium text-gray-400">
                        Pas d'image disponible
                      </div>
                    )}

                    {restaurant.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-md shadow-xs">
                        {restaurant.category}
                      </span>
                    )}
                  </div>

                  {/* CONTENU */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-[#800020]">
                        {restaurant.name}
                      </h3>

                      {/* NOTE */}
                      {rating && rating.count > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                          <span className="text-amber-500 text-sm">★</span>
                          <span className="font-bold text-gray-800">
                            {rating.average.toFixed(1)}
                          </span>
                          <span className="text-gray-400 font-light">
                            ({rating.count} avis)
                          </span>
                        </div>
                      )}

                      {restaurant.address && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-light">
                          <span>📍</span>
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </p>
                      )}

                      {restaurant.description && (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600 font-light">
                          {restaurant.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-[#800020]">
                      <span>Réserver une table</span>
                      <span className="transition transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* LIEN MOBILE */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#800020]"
          >
            Voir tous les restaurants →
          </Link>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#800020]">
              Processus simple
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Comment fonctionne Savora ?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-[#FAFAFA] p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020]/10 text-xl">
                🔎
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">01. Découvrez</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 font-light">
                Parcourez la sélection de restaurants et trouvez l'établissement qui correspond à vos envies.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-[#FAFAFA] p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020]/10 text-xl">
                📅
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">02. Réservez</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 font-light">
                Sélectionnez la date, l'heure et indiquez le nombre de personnes pour bloquer votre table.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-[#FAFAFA] p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020]/10 text-xl">
                🍽️
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">03. Savourez</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 font-light">
                Présentez-vous sur place à l'heure convenue et profitez pleinement de votre repas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#800020] to-[#500014] text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">
            Votre prochaine table vous attend.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm md:text-base text-white/80 font-light">
            Rejoignez Savora et simplifiez vos réservations de restaurants dès aujourd'hui.
          </p>
          <div className="mt-6">
            <Link
              href="/restaurants"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-xs md:text-sm font-bold text-[#800020] shadow-md transition duration-300 hover:bg-gray-100 hover:scale-[1.02] active:scale-95"
            >
              Explorer les établissements
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}