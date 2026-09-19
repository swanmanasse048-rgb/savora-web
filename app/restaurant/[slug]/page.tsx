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

// Fonction robuste pour récupérer un restaurant approuvé par slug ou par ID
async function getRestaurant(rawSlug: string) {
  const cleanSlug = sanitizeSlug(rawSlug);

  // 1. Essayer de trouver par slug exact (statut approved)
  let { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", cleanSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (restaurant) return restaurant as Restaurant;

  // 2. Si non trouvé, essayer avec un filtre insensible à la casse (.ilike)
  const { data: restaurantLike } = await supabase
    .from("restaurants")
    .select("*")
    .ilike("slug", cleanSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (restaurantLike) return restaurantLike as Restaurant;

  // 3. Enfin, essayer de chercher par ID si le slug correspond à un ID UUID
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
  let items: string[] = [];

  if (Array.isArray(raw)) {
    items = raw.flatMap((item) => {
      if (typeof item === "string") {
        if (item.startsWith("[") || item.startsWith("{")) {
          return parseServices(item);
        }
        return item;
      }
      return String(item);
    });
  } else if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      items = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim());
    } else if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseServices(parsed);
      } catch {
        items = [trimmed];
      }
    } else {
      items = trimmed.split(",").map((s) => s.trim());
    }
  }

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

function parseUrls(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter((url) => url.length > 0);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter((url) => url.length > 0);
        }
      } catch {}
    }
    if (trimmed.length > 0) return [trimmed];
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
            Nous n'avons pas trouvé l'établissement demandé (<code className="text-[#800020]">{resolvedParams.slug}</code>).
          </p>
        </div>
      </main>
    );
  }

  const r = restaurant;
  const servicesList = parseServices(r.services);
  const galleryUrls = parseUrls(r.gallery_urls);
  const menuUrls = parseUrls(r.menu_urls);

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* HEADER / HERO BANNER */}
      <section className="relative h-[420px] w-full bg-gray-900 overflow-hidden">
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105 transform duration-700 hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-[#800020]/40">
            <span className="text-white/60 font-medium">Savora Experience</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-6xl px-6 pb-10">
            {r.category && (
              <span className="inline-block mb-3 rounded-full bg-[#800020] px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase shadow-sm">
                {r.category}
              </span>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              {r.name}
            </h1>
            {r.address && (
              <p className="mt-2 flex items-center gap-2 text-base text-gray-200 font-light">
                <span>📍</span> {r.address}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Colonne de gauche (Informations & Médias) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* À propos */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3">
                À propos de l'établissement
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-600 font-light text-base">
                {r.description || "Aucune description détaillée n'a encore été renseignée pour ce restaurant."}
              </p>

              {/* Grille d'infos rapides */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Horaires</span>
                  <span className="mt-1 block text-sm font-semibold text-gray-800">
                    {r.opening_time || "--:--"} - {r.closing_time || "--:--"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Téléphone</span>
                  <span className="mt-1 block text-sm font-semibold text-gray-800">
                    {r.phone || "Non communiqué"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Ambiance</span>
                  <span className="mt-1 block text-sm font-semibold text-[#800020]">
                    {r.category || "Restaurant"}
                  </span>
                </div>
              </div>
            </div>

            {/* Services & Équipements */}
            {servicesList.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3">
                    Services & Commodités
                  </h2>
                  <span className="text-xs font-medium bg-[#800020]/10 text-[#800020] px-3 py-1 rounded-full">
                    {servicesList.length} disponibles
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {servicesList.map((serviceKey) => {
                    const service = SERVICES_MAP[serviceKey] || {
                      label: serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1),
                      icon: "✨",
                    };

                    return (
                      <div
                        key={serviceKey}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 transition hover:border-[#800020]/30 hover:bg-[#800020]/[0.02]"
                      >
                        <span className="text-xl">{service.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{service.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu / La Carte */}
            {menuUrls.length > 0 && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800020] to-[#500014] p-8 text-white shadow-md">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      Gastronomie
                    </span>
                    <h3 className="mt-3 text-2xl font-bold">Consulter la carte & les menus</h3>
                    <p className="mt-1 text-sm text-white/80 font-light">
                      Découvrez l'ensemble de nos suggestions de plats et boissons en ligne.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {menuUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#800020] transition hover:bg-gray-100 shadow-sm"
                      >
                        Voir le menu {menuUrls.length > 1 ? index + 1 : ""} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Galerie Photos */}
            {galleryUrls.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#800020] pl-3 mb-6">
                  Galerie photo
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryUrls.map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition hover:opacity-95"
                    >
                      <Image
                        src={url}
                        alt={`${r.name} - photo ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transform transition duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne de droite (Sidebar Sticky / Réservation) */}
          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm ring-1 ring-gray-900/5">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <span className="text-xs font-semibold text-[#800020] uppercase tracking-wider">Réservation</span>
                <h3 className="text-lg font-bold text-gray-900">Réserver une table</h3>
              </div>
              
              <ReservationForm restaurantId={r.id} restaurantName={r.name} />
            </div>

            {r.phone && (
              <a
                href={`tel:${r.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-white border border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 transition hover:border-[#800020] hover:text-[#800020] shadow-sm"
              >
                <span>📞</span> Contacter par téléphone
              </a>
            )}
          </aside>

        </div>
      </section>
    </main>
  );
}