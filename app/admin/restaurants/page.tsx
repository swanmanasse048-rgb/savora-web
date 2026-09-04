"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Charge la liste des restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    let query = supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur de chargement :", error);
    } else {
      setRestaurants(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filter]);

  // Modifie le statut d'un restaurant (Approved / Rejected)
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoading(id);

    const { error } = await supabase
      .from("restaurants")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert(`Erreur : ${error.message}`);
    } else {
      // Met à jour la liste locale
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }

    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validation des Restaurants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les demandes de partenariat et validez les établissements.
          </p>
        </div>

        {/* Filtres par statut */}
        <div className="flex w-fit gap-2 rounded-2xl bg-gray-200 p-1">
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filter === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filter === "approved"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Validés
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filter === "rejected"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Rejetés
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tous
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Chargement des établissements...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Aucun restaurant trouvé pour ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div>
                {/* Image du restaurant */}
                <div className="relative h-48 w-full bg-gray-100">
                  {restaurant.image_url ? (
                    <Image
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      Pas d'image
                    </div>
                  )}
                  {/* Badge de statut */}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      restaurant.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : restaurant.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {restaurant.status === "approved"
                      ? "Validé"
                      : restaurant.status === "rejected"
                      ? "Rejeté"
                      : "En attente"}
                  </span>
                </div>

                {/* Infos du restaurant */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                  {restaurant.address && (
                    <p className="mt-1 text-xs text-gray-500">📍 {restaurant.address}</p>
                  )}
                  {restaurant.phone && (
                    <p className="mt-0.5 text-xs text-gray-500">📞 {restaurant.phone}</p>
                  )}
                  {restaurant.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions de validation */}
              <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">
                {restaurant.status !== "approved" && (
                  <button
                    onClick={() => handleUpdateStatus(restaurant.id, "approved")}
                    disabled={actionLoading === restaurant.id}
                    className="flex-1 rounded-full bg-green-600 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === restaurant.id ? "Traitement..." : "Approuver"}
                  </button>
                )}

                {restaurant.status !== "rejected" && (
                  <button
                    onClick={() => handleUpdateStatus(restaurant.id, "rejected")}
                    disabled={actionLoading === restaurant.id}
                    className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === restaurant.id ? "Traitement..." : "Refuser"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}