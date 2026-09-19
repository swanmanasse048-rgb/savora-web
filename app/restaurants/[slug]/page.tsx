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
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {}
    if (raw.trim()) return [raw.trim()];
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
              <span className="inline-block mb-3 rounded-full bg-[#800020] px-4 py-1.5 text-xs font-semibold text-white uppercase">
                {restaurant.category}
              </span>
            )}
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">{restaurant.name}</h1>
            {restaurant.address && (
              <p className="mt-2 text-base text-gray-200">📍 {restaurant.address}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3">
                À propos de l'établissement
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600 font-light">
                {restaurant.description || "Aucune description renseignée."}
              </p>
            </div>

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