import { supabase } from "@/lib/supabase";
import Image from "next/image";
import ReservationForm from "@/component/reservationfrom";
import { Metadata } from "next";

type Restaurant = {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  image_url: string | null;
  opening_time: string | null;
  closing_time: string | null;
  gallery_urls: string[] | string | null;
  menu_urls: string[] | string | null;
  slug: string;
  category: string | null;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Génération dynamique des métadonnées SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) {
    return {
      title: "Restaurant introuvable | Savora",
    };
  }

  return {
    title: `${restaurant.name} | Savora`,
    description:
      restaurant.description ||
      `Réservez votre table chez ${restaurant.name} sur Savora.`,
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  // ERREUR SUPABASE
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Une erreur est survenue
          </h1>

          <p className="mt-3 text-red-500">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  // RESTAURANT INTROUVABLE
  if (!restaurant) {
    const { data: allRestaurants } = await supabase
      .from("restaurants")
      .select("slug, name");

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Restaurant introuvable
          </h1>

          <p className="mt-3 text-gray-500">
            Aucun restaurant ne correspond à :{" "}
            <code className="font-bold text-red-500">
              {slug}
            </code>
          </p>

          {allRestaurants && allRestaurants.length > 0 && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
              <p className="text-sm font-semibold text-gray-700">
                Slugs disponibles en BDD :
              </p>

              <pre className="mt-2 overflow-x-auto rounded border bg-white p-3 text-xs text-gray-800">
                {JSON.stringify(allRestaurants, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    );
  }

  const r = restaurant as Restaurant;

  // =========================================================
  // GALERIE
  // =========================================================

  let galleryUrls: string[] = [];

  if (r.gallery_urls) {
    if (Array.isArray(r.gallery_urls)) {
      galleryUrls = r.gallery_urls.filter(
        (url) =>
          typeof url === "string" &&
          url.trim() !== ""
      );
    } else if (typeof r.gallery_urls === "string") {
      try {
        const parsed = JSON.parse(r.gallery_urls);

        if (Array.isArray(parsed)) {
          galleryUrls = parsed.filter(
            (url) =>
              typeof url === "string" &&
              url.trim() !== ""
          );
        }
      } catch {
        galleryUrls = [];
      }
    }
  }

  // =========================================================
  // MENU
  // =========================================================

  let menuUrls: string[] = [];

  if (r.menu_urls) {
    // Si Supabase renvoie directement un tableau
    if (Array.isArray(r.menu_urls)) {
      menuUrls = r.menu_urls.filter(
        (url) =>
          typeof url === "string" &&
          url.trim() !== ""
      );
    }

    // Si Supabase renvoie une chaîne
    else if (typeof r.menu_urls === "string") {
      try {
        const parsed = JSON.parse(r.menu_urls);

        // Exemple :
        // ["https://site.com/menu.pdf"]
        if (Array.isArray(parsed)) {
          menuUrls = parsed.filter(
            (url) =>
              typeof url === "string" &&
              url.trim() !== ""
          );
        }

        // Si c'est une seule URL
        else if (r.menu_urls.trim() !== "") {
          menuUrls = [r.menu_urls];
        }
      } catch {
        // Si menu_urls contient directement une URL
        if (r.menu_urls.trim() !== "") {
          menuUrls = [r.menu_urls];
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">

      {/* =====================================================
          IMAGE PRINCIPALE
      ===================================================== */}

      <section className="relative h-[400px] w-full bg-gray-900">

        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800">
            <span className="text-gray-400">
              Pas d'image disponible
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#800020]/90 via-[#800020]/40 to-black/30" />

        {/* Informations */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-6xl px-6 pb-10">

            {r.category && (
              <span className="rounded-full border border-white/20 bg-[#800020]/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                {r.category}
              </span>
            )}

            <h1 className="mt-4 text-4xl font-bold text-white md:text-6xl">
              {r.name}
            </h1>

            {r.address && (
              <p className="mt-3 text-lg text-white/90">
                📍 {r.address}
              </p>
            )}

          </div>
        </div>

      </section>

      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        <div className="grid gap-10 lg:grid-cols-3">

          {/* =================================================
              INFORMATIONS
          ================================================= */}

          <div className="lg:col-span-2">

            <h2 className="text-2xl font-bold text-[#800020]">
              À propos
            </h2>

            <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
              {r.description ||
                "Découvrez ce restaurant sur Savora."}
            </p>

            {/* INFORMATIONS RESTAURANT */}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">
                  Adresse
                </p>

                <p className="mt-2 font-medium text-gray-800">
                  📍 {r.address || "Non renseignée"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">
                  Téléphone
                </p>

                <p className="mt-2 font-medium text-gray-800">
                  📞 {r.phone || "Non renseigné"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">
                  Horaires
                </p>

                <p className="mt-2 font-medium text-gray-800">
                  🕐 {r.opening_time || "--:--"} -{" "}
                  {r.closing_time || "--:--"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">
                  Catégorie
                </p>

                <p className="mt-2 font-medium text-gray-800">
                  🍽️ {r.category || "Restaurant"}
                </p>
              </div>

            </div>

            {/* =================================================
                GALERIE
            ================================================= */}

            {galleryUrls.length > 0 && (
              <section className="mt-12">

                <h2 className="text-2xl font-bold text-[#800020]">
                  Galerie
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">

                  {galleryUrls.map(
                    (url: string, index: number) => (
                      <div
                        key={index}
                        className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#800020]/10 bg-gray-100 shadow-sm"
                      >
                        <Image
                          src={url}
                          alt={`${r.name} - photo ${
                            index + 1
                          }`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                MENU
            ================================================= */}

            {menuUrls.length > 0 && (
              <section className="mt-12">

                <div className="rounded-3xl border border-[#800020]/15 bg-[#800020]/5 p-6 md:p-8">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-widest text-[#800020]">
                        La carte
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        Menu de {r.name}
                      </h2>

                      <p className="mt-2 text-gray-500">
                        Découvrez les plats et boissons
                        proposés par le restaurant.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                      {menuUrls.map(
                        (url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-[#800020] px-6 py-3 font-semibold text-white transition hover:bg-[#600018]"
                          >
                            🍽️{" "}
                            {menuUrls.length > 1
                              ? `Voir le menu ${
                                  index + 1
                                }`
                              : "Voir le menu"}
                          </a>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </section>
            )}

          </div>

          {/* =================================================
              RÉSERVATION
          ================================================= */}

          <aside className="sticky top-6 self-start space-y-4">

            <ReservationForm
              restaurantId={r.id}
              restaurantName={r.name}
            />

            {r.phone && (
              <a
                href={`tel:${r.phone}`}
                className="block w-full rounded-full border border-[#800020] px-6 py-3.5 text-center font-medium text-[#800020] transition hover:bg-[#800020] hover:text-white"
              >
                📞 Appeler le restaurant
              </a>
            )}

          </aside>

        </div>

      </section>

    </main>
  );
}