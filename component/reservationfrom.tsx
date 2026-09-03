"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type ReservationFormProps = {
  restaurantId: string;
  restaurantName?: string;
};

export default function ReservationForm({
  restaurantId,
  restaurantName,
}: ReservationFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Vérification de la session utilisateur
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingUser(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!date || !time) {
      setMessage({ type: "error", text: "Veuillez choisir une date et une heure." });
      return;
    }

    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);

    try {
      // 1. Insertion de la réservation et récupération de l'ID généré
      const { data: reservationData, error: reservationError } = await supabase
        .from("reservations")
        .insert([
          {
            user_id: user.id,
            restaurant_id: restaurantId,
            reservation_date: date,
            reservation_time: time,
            guests: guests,
            special_request: specialRequests.trim() || null,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (reservationError) {
        console.error("Erreur réservation :", reservationError);
        setMessage({
          type: "error",
          text: `Impossible d'effectuer la réservation : ${reservationError.message}`,
        });
        setLoading(false);
        return;
      }

      // 2. Récupération du gérant du restaurant (owner_id)
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("owner_id, name")
        .eq("id", restaurantId)
        .single();

      if (restaurantError) {
        console.error("Erreur récupération restaurant :", restaurantError);
      }

      // 3. Envoi de la notification au gérant
      if (restaurantData?.owner_id) {
        const clientName = user.user_metadata?.full_name || user.email || "Un client";
        const name = restaurantName || restaurantData.name || "votre établissement";

        const { error: notifError } = await supabase.from("notifications").insert([
          {
            user_id: restaurantData.owner_id,
            restaurant_id: restaurantId,
            reservation_id: reservationData.id,
            title: "Nouvelle réservation ! 🍽️",
            message: `${clientName} a réservé une table pour ${guests} pers. chez ${name} le ${date} à ${time}.`,
            type: "new_reservation",
            is_read: false,
          },
        ]);

        if (notifError) {
          console.error("Erreur lors de l'envoi de la notification :", notifError);
        }
      }

      setMessage({
        type: "success",
        text: `Votre demande de réservation ${restaurantName ? `chez ${restaurantName}` : ""} a été envoyée avec succès 🎉`,
      });

      setDate("");
      setTime("");
      setGuests(2);
      setSpecialRequests("");
    } catch (err) {
      console.error("Erreur inattendue :", err);
      setMessage({ type: "error", text: "Une erreur inattendue est survenue." });
    }

    setLoading(false);
  };

  if (loadingUser) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl text-center text-sm text-gray-500">
        Chargement du formulaire...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#800020]/10 bg-white p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900">
        Réserver une table {restaurantName ? `chez ${restaurantName}` : ""}
      </h3>

      {message && (
        <div
          className={`mt-4 rounded-2xl p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {!user ? (
        <div className="mt-6 rounded-2xl bg-[#800020]/5 p-6 text-center border border-[#800020]/10">
          <p className="text-sm text-gray-700">
            Vous devez être connecté à votre compte Savora pour effectuer une réservation.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
              className="rounded-full bg-[#800020] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018]"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleReservation} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Heure
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nombre de personnes
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "personne" : "personnes"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Demande spéciale <span className="text-gray-400 font-normal">(Optionnel)</span>
            </label>
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Ex: Anniversaire, chaise haute, table en terrasse..."
              className="mt-1 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-[#800020] focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#800020] py-3.5 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#600018] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Confirmer la réservation"}
          </button>
        </form>
      )}
    </div>
  );
}