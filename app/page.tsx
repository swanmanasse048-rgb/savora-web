import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function Home() {
  // Récupération des restaurants
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, description, image_url, address, category"
    )
    .limit(6);

  if (error) {
    console.error(
      "Erreur lors de la récupération des restaurants:",
      error.message
    );
  }

  // =========================================================
  // RÉCUPÉRATION DES AVIS
  // =========================================================

  const restaurantIds =
    restaurants?.map((restaurant) => restaurant.id) || [];

  let reviews: {
    restaurant_id: string;
    rating: number;
  }[] = [];

  if (restaurantIds.length > 0) {
    const { data: reviewsData, error: reviewsError } =
      await supabase
        .from("reviews")
        .select("restaurant_id, rating")
        .in("restaurant_id", restaurantIds);

    if (reviewsError) {
      console.error(
        "Erreur lors de la récupération des avis:",
        reviewsError.message
      );
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

    ratingsByRestaurant[review.restaurant_id].average +=
      Number(review.rating);

    ratingsByRestaurant[review.restaurant_id].count += 1;
  });

  Object.keys(ratingsByRestaurant).forEach((restaurantId) => {
    const data = ratingsByRestaurant[restaurantId];

    data.average = data.average / data.count;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-[#800020] via-[#65001a] to-[#500014] text-white">

        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">

          <div className="max-w-3xl">

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md shadow-sm">
              <span>🍽️</span>
              Bienvenue sur Savora
            </span>

            <h1 className="mt-8 text-5xl font-black tracking-tight leading-tight md:text-7xl">
              Découvrez.
              <br />
              Réservez.
              <br />

              <span className="text-amber-300">
                Savourez.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Découvrez les meilleures tables autour de vous
              et réservez votre expérience culinaire en quelques clics.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/restaurants"
                className="rounded-full bg-white px-8 py-4 text-base font-bold text-[#800020] shadow-xl transition hover:bg-gray-100 hover:scale-105 active:scale-95"
              >
                Découvrir les restaurants
              </Link>

              <Link
                href="/download"
                className="rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/50"
              >
                Télécharger l'app
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          RESTAURANTS POPULAIRES
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-end justify-between gap-6">

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-[#800020]">
              À découvrir
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Restaurants populaires
            </h2>

          </div>

          <Link
            href="/restaurants"
            className="hidden items-center gap-1 text-sm font-bold text-[#800020] transition hover:translate-x-1 md:inline-flex"
          >
            Voir tous les restaurants →
          </Link>

        </div>

        {/* =================================================
            CARTES RESTAURANTS
        ================================================= */}

        {!restaurants || restaurants.length === 0 ? (

          <div className="mt-12 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">

            <p className="text-base font-medium text-gray-600">
              Aucun restaurant disponible pour le moment.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Revenez bientôt pour découvrir de nouvelles adresses !
            </p>

          </div>

        ) : (

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {restaurants.map((restaurant) => {

              const rating =
                ratingsByRestaurant[restaurant.id];

              return (

                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.slug || restaurant.id}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#800020]/20 hover:shadow-2xl"
                >

                  {/* IMAGE */}

                  <div className="relative h-64 w-full overflow-hidden bg-gray-100">

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

                      <div className="flex h-full items-center justify-center bg-gray-50 text-sm font-medium text-gray-400">
                        Pas d'image disponible
                      </div>

                    )}

                    {restaurant.category && (

                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-gray-800 backdrop-blur-md shadow-sm">
                        {restaurant.category}
                      </span>

                    )}

                  </div>

                  {/* CONTENU */}

                  <div className="flex flex-1 flex-col justify-between p-6">

                    <div>

                      <h3 className="text-xl font-bold text-gray-900 transition group-hover:text-[#800020]">
                        {restaurant.name}
                      </h3>

                      {/* NOTE */}

                      {rating && rating.count > 0 && (

                        <div className="mt-2 flex items-center gap-2">

                          <span className="text-lg text-amber-500">
                            ★
                          </span>

                          <span className="font-bold text-gray-900">
                            {rating.average.toFixed(1)}
                          </span>

                          <span className="text-sm text-gray-500">
                            ({rating.count}{" "}
                            {rating.count === 1
                              ? "avis"
                              : "avis"})
                          </span>

                        </div>

                      )}

                      {restaurant.address && (

                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                          <span>📍</span>
                          {restaurant.address}
                        </p>

                      )}

                      {restaurant.description && (

                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {restaurant.description}
                        </p>

                      )}

                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#800020] transition group-hover:translate-x-1">
                      Réserver une table
                      <span>→</span>
                    </div>

                  </div>

                </Link>

              );

            })}

          </div>

        )}

        {/* MOBILE */}

        <div className="mt-10 text-center md:hidden">

          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-base font-bold text-[#800020]"
          >
            Voir tous les restaurants →
          </Link>

        </div>

      </section>

      {/* =====================================================
          COMMENT ÇA MARCHE
      ===================================================== */}

      <section className="border-y border-[#800020]/10 bg-[#800020]/5">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">

            <p className="text-xs font-bold uppercase tracking-widest text-[#800020]">
              Simple et rapide
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Comment fonctionne Savora ?
            </h2>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">

            <div className="rounded-3xl border border-[#800020]/10 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#800020]/10 text-2xl">
                🔎
              </div>

              <h3 className="mt-6 text-xl font-bold">
                01. Découvrez
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Parcourez une sélection de restaurants
                et trouvez la table idéale.
              </p>

            </div>

            <div className="rounded-3xl border border-[#800020]/10 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#800020]/10 text-2xl">
                📅
              </div>

              <h3 className="mt-6 text-xl font-bold">
                02. Réservez
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Choisissez la date, l'heure et le nombre
                d'invités.
              </p>

            </div>

            <div className="rounded-3xl border border-[#800020]/10 bg-white p-8 shadow-sm transition duration-300 hover:shadow-lg">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#800020]/10 text-2xl">
                🍽️
              </div>

              <h3 className="mt-6 text-xl font-bold">
                03. Savourez
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Présentez-vous au restaurant et profitez
                de votre expérience.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-gradient-to-r from-[#800020] to-[#500014] text-white">

        <div className="mx-auto max-w-4xl px-6 py-24 text-center">

          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Votre prochaine table vous attend.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Rejoignez la communauté Savora et réservez
            votre prochaine sortie au restaurant dès aujourd'hui.
          </p>

          <div className="mt-8">

            <Link
              href="/restaurants"
              className="inline-block rounded-full bg-white px-9 py-4 text-base font-bold text-[#800020] shadow-2xl transition hover:bg-gray-100 hover:scale-105 active:scale-95"
            >
              Explorer Savora
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}