import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Vérifier la session utilisateur
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirectTo=/admin");
  }

  // 2. Vérifier le rôle dans la table profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/"); // Redirection si l'utilisateur n'est pas admin
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