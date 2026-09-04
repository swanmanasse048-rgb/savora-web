import { createClient } from "@/lib/supabase-server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Récupération sécurisée des statistiques avec authentification serveur
  const [{ count: restaurantsCount }, { count: reservationsCount }, { count: usersCount }] =
    await Promise.all([
      supabase.from("restaurants").select("*", { count: "exact", head: true }),
      supabase.from("reservations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
      <p className="text-gray-500 mt-1">Aperçu global de l'activité de Savora.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-sm font-semibold text-gray-500">Total Restaurants</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{restaurantsCount ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-sm font-semibold text-gray-500">Total Réservations</p>
          <p className="text-4xl font-bold text-[#800020] mt-2">{reservationsCount ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-sm font-semibold text-gray-500">Utilisateurs inscrits</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{usersCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}