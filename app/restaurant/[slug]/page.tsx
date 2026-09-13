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
  services: any;
  slug: string;
  category: string | null;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SERVICES_MAP: Record<string, { label: string; icon: string }> = {
  wifi: { label: "Wi-Fi", icon: "📶" },
  parking: { label: "Parking", icon: "🅿️" },
  ac: { label: "Climatisation", icon: "❄️" },
  terrace: { label: "Terrasse", icon: "🌳" },
  vip_room: { label: "Salon VIP", icon: "👔" },
  live_music: { label: "Live Music", icon: "🎶" },
  mobile_money: { label: "M-Pesa / Mobile", icon: "📲" },
  card_payment: { label: "Carte Bancaire", icon: "💳" },
};

function sanitizeSlug(slug: string) {
  return decodeURIComponent(slug).trim().toLowerCase();
}

/**
  Parser universel ultra-robuste pour `services`
 */
function parseServices(raw: any): string[] {
  if (!raw) return [];

  let items: string[] = [];

  // Si c'est déjà un tableau JS/TS
  if (Array.isArray(raw)) {
    items = raw.flatMap((item) => {
      if (typeof item === "string") {
        // Gère le cas où un élément du tableau est lui-même une chaîne JSON ou PostgreSQL array literal
        if (item.startsWith("[") || item.startsWith("{")) {
          return parseServices(item);
        }
        return item;
      }
      return String(item);
    });
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();

    // Cas 1: PostgreSQL literal array syntax `{"wifi", "parking"}` ou `{wifi,parking}`
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      items = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim());
    } 
    // Cas 2: Chaîne JSON `["wifi", "parking"]`
    else if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseServices(parsed);
      } catch {
        items = [trimmed];
      }
    } 
    // Cas 3: Simple chaîne séparée par des virgules ou mot unique
    else {
      items = trimmed.split(",").map((s) => s.trim());
    }
  }

  // Nettoyage final : suppression des guillemets, crochets, espaces et doublons
  return Array.from(
    new Set(
      items
        .map((i) =>
          String(i)
            .replace(/[\[\]\\"{}]/g, "")
            .trim()
            .toLowerCase()
        )
        .filter((i) => i.length > 0)
    )
  );
}

/**
  Parser universel pour les URLs (Galerie / Menu)
 */
function parseUrls(raw: any): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item).trim())
      .filter((url) => url.length > 0);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).trim())
            .filter((url) => url.length > 0);
        }
      } catch {
        // En cas d'erreur de parse, retourner l'élément brut s'il n'est pas vide
      }
    }
    if (trimmed.length > 0) return [trimmed];
  }

  return [];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cleanSlug = sanitizeSlug(resolvedParams.slug);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description")
    .ilike("slug", cleanSlug)
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
  const resolvedParams = await params;
  const cleanSlug = sanitizeSlug(resolvedParams.slug);

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .ilike("slug", cleanSlug)
    .maybeSingle();

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Une erreur est survenue
          </h1>
          <p className="mt-3 text-red-500">{error.message}</p>
        </div>
      </main>
    );
  }

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
            <code className="font-bold text-red-500">{resolvedParams.slug}</code>
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

  // Extraction sécurisée des collections
  const servicesList = parseServices(r.services);
  const galleryUrls = parseUrls(r.gallery_urls);
  const menuUrls = parseUrls(r.menu_urls);

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER / IMAGE PRINCIPALE */}
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
            <span className="text-gray-400">Pas d'image disponible</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#800020]/90 via-[#800020]/40 to-black/30" />

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
              <p className="mt-3 text-lg text-white/90">📍 {r.address}</p>
            )}
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* INFORMATIONS ET DETAILS */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#800020]">À propos</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
              {r.description || "Découvrez ce restaurant sur Savora."}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">Adresse</p>
                <p className="mt-2 font-medium text-gray-800">
                  📍 {r.address || "Non renseignée"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">Téléphone</p>
                <p className="mt-2 font-medium text-gray-800">
                  📞 {r.phone || "Non renseigné"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">Horaires</p>
                <p className="mt-2 font-medium text-gray-800">
                  🕐 {r.opening_time || "--:--"} - {r.closing_time || "--:--"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#800020]/15 bg-[#800020]/5 p-5">
                <p className="text-sm font-medium text-[#800020]">Catégorie</p>
                <p className="mt-2 font-medium text-gray-800">
                  🍽️ {r.category || "Restaurant"}
                </p>
              </div>
            </div>

            {/* SERVICES & ÉQUIPEMENTS */}
            {servicesList.length > 0 && (
              <section className="mt-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Services & Équipements
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Ce que cet établissement met à votre disposition
                    </p>
                  </div>
                  <span className="rounded-full bg-[#800020]/10 px-3.5 py-1.5 text-xs font-semibold text-[#800020]">
                    {servicesList.length} service{servicesList.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {servicesList.map((serviceKey) => {
                    const service = SERVICES_MAP[serviceKey] || {
                      label: serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1),
                      icon: "✨",
                    };

                    return (
                      <div
                        key={serviceKey}
                        className="group relative flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#800020]/30 hover:bg-[#800020]/[0.02] hover:shadow-md"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#800020]/5 text-2xl transition duration-300 group-hover:scale-110 group-hover:bg-[#800020] group-hover:text-white">
                          <span>{service.icon}</span>
                        </div>

                        <span className="mt-3 text-sm font-semibold text-gray-800 transition group-hover:text-[#800020]">
                          {service.label}
                        </span>

                        <span className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Inclus
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* GALERIE */}
            {galleryUrls.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-[#800020]">Galerie</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {galleryUrls.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative h-48 w-full overflow-hidden rounded-2xl border border-[#800020]/10 bg-gray-100 shadow-sm"
                    >
                      <Image
                        src={url}
                        alt={`${r.name} - photo ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MENU */}
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
                        Découvrez les plats et boissons proposés par le restaurant.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {menuUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#800020] px-6 py-3 font-semibold text-white transition hover:bg-[#600018]"
                        >
                          🍽️{" "}
                          {menuUrls.length > 1
                            ? `Voir le menu ${index + 1}`
                            : "Voir le menu"}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* FORMULAIRE DE RESERVATION */}
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