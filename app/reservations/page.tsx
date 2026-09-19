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
  table: {
    table_number: string;
    capacity: number;
    location: string | null;
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

      // 1. Récupération initiale des données incluant la table choisie
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id,
          reservation_date,
          reservation_time,
          guests,
          status,
          restaurant:restaurants(name, image_url, address, slug),
          table:tables(table_number, capacity, location)
        `)
        .eq("user_id", userId)
        .order("reservation_date", { ascending: false });

      if (!error && data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          restaurant: Array.isArray(item.restaurant)
            ? item.restaurant[0]
            : item.restaurant,
          table: Array.isArray(item.table)
            ? item.table[0]
            : item.table,
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
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-gray-100" />

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 w-full animate-pulse rounded-3xl bg-white border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] selection:bg-[#800020] selection:text-white py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* EN-TÊTE ÉPURÉ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="inline-block rounded-full bg-[#800020]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#800020] mb-2">
              Mon Espace
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Mes réservations
            </h1>
            <p className="mt-1 text-sm text-gray-500 font-light">
              Suivez l'état de vos tables et gérez vos sorties gourmandes.
            </p>
          </div>

          <Link
            href="/restaurants"
            className="inline-flex items-center justify-center rounded-2xl bg-[#800020] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#600018] shadow-sm"
          >
            + Réserver une table
          </Link>
        </div>

        {/* ÉTAT VIDE */}
        {reservations.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#800020]/10 text-2xl text-[#800020] mb-4">
              🍷
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Aucune réservation en cours
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 font-light">
              Vous n'avez pas encore réservé de table. Explorez nos partenaires pour votre prochain repas.
            </p>
            <Link
              href="/restaurants"
              className="mt-6 inline-flex items-center rounded-2xl bg-[#800020] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#600018]"
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
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#800020]/30 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  
                  {/* INFORMATIONS DU RESTAURANT & DE LA TABLE */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                      {item.restaurant?.image_url ? (
                        <Image
                          src={item.restaurant.image_url}
                          alt={item.restaurant.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl text-gray-400">
                          🍽️
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#800020] transition">
                        {item.restaurant?.name || "Restaurant"}
                      </h2>
                      {item.restaurant?.address && (
                        <p className="mt-0.5 text-xs text-gray-500 font-light flex items-center gap-1">
                          📍 {item.restaurant.address}
                        </p>
                      )}

                      {/* BADGES DÉTAILS (Date, Heure, Personnes, Table) */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 border border-gray-100 text-gray-700">
                          📅 {item.reservation_date}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 border border-gray-100 text-gray-700">
                          🕒 {item.reservation_time}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 border border-gray-100 text-gray-700">
                          👥 {item.guests} pers.
                        </span>
                        {item.table && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-[#800020]/5 px-3 py-1.5 border border-[#800020]/10 text-[#800020] font-semibold">
                            🪑 Table {item.table.table_number} {item.table.location ? `(${item.table.location})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STATUT & ACTION */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-gray-100 pt-4 sm:border-0 sm:pt-0 gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${
                        item.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : item.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : item.status === "cancelled"
                          ? "bg-gray-50 text-gray-500 border border-gray-200"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
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
                        className="text-xs font-medium text-gray-400 hover:text-[#800020] transition disabled:opacity-50"
                      >
                        {cancellingId === item.id ? "Annulation..." : "Annuler"}
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