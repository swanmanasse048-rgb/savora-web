"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "client" | "restaurant_owner" | "admin";
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur utilisateurs :", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Profile["role"]) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      alert(`Erreur lors du changement de rôle : ${error.message}`);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les rôles des comptes inscrits sur Savora.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          Chargement des utilisateurs...
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Nom complet</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Téléphone</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Rôle actuel</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Changer le rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {u.full_name || "Non renseigné"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "restaurant_owner"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as Profile["role"])
                      }
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-medium focus:border-[#800020] focus:outline-none"
                    >
                      <option value="client">Client</option>
                      <option value="restaurant_owner">Gérant</option>
                      <option value="admin">Administrateur</option>
                    </select>
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