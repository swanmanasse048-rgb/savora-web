import { supabase } from "@/lib/supabase";
import Image from "next/image";
import ReservationForm from "@/component/reservationfrom";
import { Metadata } from "next";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  image_url: string | null;
  opening_time: string | null;
  closing_time: string | null;
  gallery_urls: any;
  menu_urls: any;
  services: any;
  slug: string;
  category: string | null;
  status: string | null;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SERVICES_MAP: Record<string, { label: string; icon: string }> = {
  wifi: { label: "Wi-Fi", icon: "📶" },
  parking: { label: "Parking", icon: "🅿️" },
  ac: { label: "Climatisation", icon: "❄️" },
  terrasse: { label: "Terrasse", icon: "🌳" },
  vip_room: { label: "Salon VIP", icon: "👔" },
  live_music: { label: "Live Music", icon: "🎶" },
  mobile_money: { label: "M-Pesa / Mobile", icon: "📲" },
  card_payment: { label: "Carte Bancaire", icon: "💳" },
};

function sanitizeSlug(slug: string) {
  return decodeURIComponent(slug)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getRestaurant(rawSlug: string) {
  const cleanSlug = sanitizeSlug(rawSlug);

  // 1. Recherche par slug exact (statut approved)
  let { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", cleanSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (restaurant) return restaurant as Restaurant;

  // 2. Recherche insensible à la casse (.ilike)
  const { data: restaurantLike } = await supabase
    .from("restaurants")
    .select("*")
    .ilike("slug", cleanSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (restaurantLike) return restaurantLike as Restaurant;

  // 3. Recherche par ID UUID
  const { data: restaurantById } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", cleanSlug)
    .eq("status", "approved")
    .maybeSingle();

  return restaurantById as Restaurant | null;
}

function parseServices(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return raw.replace(/[{}]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseUrls(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  
  if (typeof raw === "string") {
    let cleaned = raw.trim();
    if (!cleaned) return [];

    // Essayer de parser si c'est du JSON
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {}

    // Gérer le format tableau Postgres ou texte brut avec séparateurs
    if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned
      .split(",")
      .map((s) => s.replace(/^["']|["']|[\[\]{}]/g, "").trim())
      .filter(Boolean);
  }
  
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const restaurant = await getRestaurant(resolvedParams.slug);

  if (!restaurant) {
    return { title: "Restaurant introuvable | Savora" };
  }

  return {
    title: `${restaurant.name} | Savora`,
    description: restaurant.description || `Réservez votre table chez ${restaurant.name} sur Savora.`,
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const resolvedParams = await params;
  const restaurant = await getRestaurant(resolvedParams.slug);

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#800020]/10 text-[#800020] text-2xl mb-4">
            🍽️
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant introuvable</h1>
          <p className="mt-2 text-sm text-gray-500">
            L'établissement demandé n'existe pas ou n'est plus disponible.
          </p>
        </div>
      </main>
    );
  }

  const servicesList = parseServices(restaurant.services);
  const galleryUrls = parseUrls(restaurant.gallery_urls);
  const menuUrls = parseUrls(restaurant.menu_urls);

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* En-tête avec image de couverture, catégorie, nom et adresse */}
      <section className="relative h-[420px] w-full bg-gray-900 overflow-hidden">
        {restaurant.image_url ? (
          <Image src={restaurant.image_url} alt={restaurant.name} fill priority className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white/60">Savora</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-6xl px-6 pb-10">
            {restaurant.category && (
              <span className="inline-block mb-3 rounded-full bg-[#800020] px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                {restaurant.category}
              </span>
            )}
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">{restaurant.name}</h1>
            {restaurant.address && (
              <p className="mt-2 text-base text-gray-200 flex items-center gap-2">
                <span>📍</span> {restaurant.address}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3">
                À propos de l'établissement
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600 font-light">
                {restaurant.description || "Aucune description renseignée."}
              </p>
            </div>

            {/* Horaires et Localisation */}
            {(restaurant.opening_time || restaurant.closing_time) && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3 mb-4">
                  Horaires d'ouverture
                </h2>
                <p className="text-gray-600">
                  🕒 Ouvert de <span className="font-semibold text-gray-900">{restaurant.opening_time || "N/A"}</span> à <span className="font-semibold text-gray-900">{restaurant.closing_time || "N/A"}</span>
                </p>
              </div>
            )}

            {/* Galerie Photos */}
            {galleryUrls.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3 mb-6">
                  Galerie Photos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative h-36 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <Image src={url} alt={`${restaurant.name} - photo ${index + 1}`} fill className="object-cover hover:scale-105 transition duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menus du restaurant */}
            {menuUrls.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3 mb-6">
                  Menus & Carte
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Voir le menu #{index + 1}</p>
                        <p className="text-xs text-gray-500">Ouvrir le document</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Services & Commodités */}
            {servicesList.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3 mb-6">
                  Services & Commodités
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {servicesList.map((key) => {
                    const s = SERVICES_MAP[key] || { label: key, icon: "✨" };
                    return (
                      <div key={key} className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                        <span>{s.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire de réservation fixe sur le côté */}
          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Réserver une table</h3>
              <ReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}