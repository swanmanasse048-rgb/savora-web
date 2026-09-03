"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  restaurant: {
    name: string;
    image_url: string | null;
    address: string | null;
    slug: string | null;
  } | null;
}

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchReservationsAndSubscribe = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // 1. Récupération initiale des données
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id,
          reservation_date,
          reservation_time,
          guests,
          status,
          restaurant:restaurants(name, image_url, address, slug)
        `)
        .eq("user_id", userId)
        .order("reservation_date", { ascending: false });

      if (!error && data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          restaurant: Array.isArray(item.restaurant)
            ? item.restaurant[0]
            : item.restaurant,
        }));
        setReservations(formattedData);
      }
      setLoading(false);

      // 2. Écoute en temps réel des mises à jour de statut
      channel = supabase
        .channel(`user-reservations-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "reservations",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updated = payload.new as { id: string; status: Reservation["status"] };
            setReservations((prev) =>
              prev.map((r) =>
                r.id === updated.id ? { ...r, status: updated.status } : r
              )
            );
          }
        )
        .subscribe();
    };

    fetchReservationsAndSubscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  const handleCancel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    setCancellingId(id);
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
      );
    }
    setCancellingId(null);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-[#800020]/10" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded-lg bg-gray-100" />

        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-2xl bg-gray-50 border border-[#800020]/10"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#800020]/5 via-white to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#800020]/15 pb-8">
          <div>
            <span className="inline-block rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#800020]">
              Mon espace Savora
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Mes réservations
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Gérez vos tables réservées et retrouvez votre historique gourmand.
            </p>
          </div>

          <Link
            href="/restaurants"
            className="inline-flex items-center justify-center rounded-full bg-[#800020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#600018] shadow-sm"
          >
            + Réserver une table
          </Link>
        </div>

        {/* ÉTAT VIDE */}
        {reservations.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#800020]/20 bg-[#800020]/5 p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#800020] text-2xl text-white shadow-md">
              🍷
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Aucune réservation pour le moment
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-600">
              Vous n'avez pas encore réservé de table. Explorez nos établissements partenaires pour planifier votre prochaine sortie.
            </p>
            <Link
              href="/restaurants"
              className="mt-6 inline-flex items-center rounded-full bg-[#800020] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018]"
            >
              Découvrir les restaurants
            </Link>
          </div>
        ) : (
          /* LISTE DES RÉSERVATIONS */
          <div className="mt-8 space-y-4">
            {reservations.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-[#800020]/15 bg-white p-5 shadow-sm transition hover:border-[#800020]/30 hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  
                  {/* INFORMATIONS DU RESTAURANT */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#800020]/5 border border-[#800020]/15">
                      {item.restaurant?.image_url ? (
                        <Image
                          src={item.restaurant.image_url}
                          alt={item.restaurant.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl text-[#800020]">
                          🍽️
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#800020] transition">
                        {item.restaurant?.name || "Restaurant"}
                      </h2>
                      {item.restaurant?.address && (
                        <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                          📍 {item.restaurant.address}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-gray-700">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#800020]/5 px-2.5 py-1 border border-[#800020]/15 text-[#800020]">
                          📅 {item.reservation_date}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#800020]/5 px-2.5 py-1 border border-[#800020]/15 text-[#800020]">
                          🕒 {item.reservation_time}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#800020]/5 px-2.5 py-1 border border-[#800020]/15 text-[#800020]">
                          👥 {item.guests} pers.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BADGE DE STATUT & BOUTONS */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-gray-100 pt-3 sm:border-0 sm:pt-0 gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : item.status === "rejected"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : item.status === "cancelled"
                          ? "bg-gray-100 text-gray-500 border border-gray-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.status === "accepted"
                            ? "bg-emerald-600"
                            : item.status === "rejected"
                            ? "bg-rose-600"
                            : item.status === "cancelled"
                            ? "bg-gray-400"
                            : "bg-amber-600 animate-pulse"
                        }`}
                      />
                      {item.status === "accepted"
                        ? "Acceptée"
                        : item.status === "rejected"
                        ? "Refusée"
                        : item.status === "cancelled"
                        ? "Annulée"
                        : "En attente"}
                    </span>

                    {item.status !== "cancelled" && item.status !== "rejected" && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={cancellingId === item.id}
                        className="text-xs font-semibold text-gray-400 hover:text-[#800020] transition disabled:opacity-50"
                      >
                        {cancellingId === item.id ? "Annulation..." : "Annuler la réservation"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}