"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  special_request: string | null;
  created_at: string;
  restaurants: { name: string } | null;
  profiles: { full_name: string; phone: string } | null;
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  const fetchReservations = async () => {
    setLoading(true);
    let query = supabase
      .from("reservations")
      .select(`
        id,
        reservation_date,
        reservation_time,
        guests,
        status,
        special_request,
        created_at,
        restaurants ( name ),
        profiles ( full_name, phone )
      `)
      .order("reservation_date", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur réservations :", error);
    } else {
      setReservations((data as unknown as Reservation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: "confirmed" | "cancelled") => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert(`Erreur : ${error.message}`);
    } else {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Toutes les réservations passées sur l'application Savora.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex w-fit gap-2 rounded-2xl bg-gray-200 p-1">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                filter === status
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {status === "all"
                ? "Toutes"
                : status === "pending"
                ? "En attente"
                : status === "confirmed"
                ? "Confirmées"
                : "Annulées"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Chargement des réservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Aucune réservation trouvée.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Restaurant</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Date & Heure</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Personnes</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {res.profiles?.full_name || "Client anonyme"}
                    </p>
                    {res.profiles?.phone && (
                      <p className="text-xs text-gray-500">{res.profiles.phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {res.restaurants?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {res.reservation_date} à {res.reservation_time}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {res.guests} pers.
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        res.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : res.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {res.status === "confirmed"
                        ? "Confirmée"
                        : res.status === "cancelled"
                        ? "Annulée"
                        : "En attente"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {res.status !== "confirmed" && (
                        <button
                          disabled={updatingId === res.id}
                          onClick={() => updateStatus(res.id, "confirmed")}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          Confirmer
                        </button>
                      )}
                      {res.status !== "cancelled" && (
                        <button
                          disabled={updatingId === res.id}
                          onClick={() => updateStatus(res.id, "cancelled")}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}