import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Obtenir l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  // 2. Récupérer le rôle dans la table profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Logs pour identifier précisément le blocage dans le terminal VS Code
  console.log("--- DEBUG ADMIN LAYOUT ---");
  console.log("ID Utilisateur connecté :", user.id);
  console.log("Profil trouvé :", profile);
  console.log("Erreur éventuelle :", error);
  console.log("---------------------------");

  // Si le rôle n'est pas admin, renvoyer vers la page d'accueil
  if (error || !profile || profile.role !== "admin") {
    console.log("⚠️ Accès refusé : Le profil n'a pas le rôle 'admin'.");
    redirect("/"); 
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barre latérale (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold text-[#800020] mb-8">Savora Admin</h2>
        <nav className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="hover:bg-slate-800 p-3 rounded-xl font-medium transition"
          >
            📊 Vue d'ensemble
          </Link>
          <Link
            href="/admin/restaurants"
            className="hover:bg-slate-800 p-3 rounded-xl font-medium transition"
          >
            🏪 Restaurants
          </Link>
          <Link
            href="/admin/reservations"
            className="hover:bg-slate-800 p-3 rounded-xl font-medium transition"
          >
            📅 Réservations
          </Link>
          <Link
            href="/admin/users"
            className="hover:bg-slate-800 p-3 rounded-xl font-medium transition"
          >
            👥 Utilisateurs
          </Link>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}