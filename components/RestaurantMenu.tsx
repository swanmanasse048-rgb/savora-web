"use client";

import Image from "next/image";

// Structure exacte selon vos colonnes Supabase
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  image_url?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  created_at?: string;
  gallery_urls?: string[] | string | null;
  slug?: string | null;
  category?: string | null;
  menu_urls?: string[] | { title?: string; url: string }[] | null;
}

interface RestaurantMenuProps {
  restaurant: Restaurant;
}

export default function RestaurantMenu({ restaurant }: RestaurantMenuProps) {
  // Extraction sécurisée des URLs du champ jsonb menu_urls
  const rawMenus = restaurant.menu_urls;

  const menus: { title: string; url: string }[] = Array.isArray(rawMenus)
    ? rawMenus.map((item, index) => {
        if (typeof item === "string") {
          return { title: `Carte / Menu ${index + 1}`, url: item };
        }
        return {
          title: item.title || `Menu ${index + 1}`,
          url: item.url,
        };
      })
    : [];

  if (menus.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
        <p className="text-sm font-medium text-gray-500">
          Aucune carte ou menu n'est disponible pour ce restaurant pour le moment.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Carte & Menus
          </h2>
          <p className="text-sm text-gray-500">
            Consultez les cartes et menus proposés par {restaurant.name}
          </p>
        </div>
        <span className="rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold text-[#800020]">
          {menus.length} {menus.length > 1 ? "menus" : "menu"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu, index) => {
          const isPdf = menu.url.toLowerCase().endsWith(".pdf");

          return (
            <a
              key={index}
              href={menu.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#800020]/20 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#800020]/5 text-[#800020] transition group-hover:bg-[#800020] group-hover:text-white">
                  {isPdf ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#800020]">
                    {menu.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {isPdf ? "Document PDF" : "Image / Document"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#800020]">
                <span>Consulter</span>
                <svg
                  className="h-4 w-4 transition transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}