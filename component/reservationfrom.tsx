'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Table {
  id: string;
  name: string;
  number?: string | number;
  capacity?: number;
}

interface ReservationFormProps {
  restaurantId: string;
  restaurantName: string;
}

export default function ReservationForm({ restaurantId, restaurantName }: ReservationFormProps) {
  const [fulfillmentType, setFulfillmentType] = useState<'sur_place' | 'a_emporter'>('sur_place');
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequest, setSpecialRequest] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Charger les tables disponibles pour ce restaurant (nom, numéro, capacité)
  useEffect(() => {
    async function fetchTables() {
      const { data, error } = await supabase
        .from('tables')
        .select('id, name, number, capacity')
        .eq('restaurant_id', restaurantId);

      if (!error && data) {
        setTables(data);
      }
    }

    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  // Filtrer intelligemment les tables selon la capacité et le nombre de convives
  const filteredTables = tables.filter((table) => {
    if (!table.capacity) return true;
    return table.capacity >= parseInt(guests, 10);
  });

  // Réinitialiser la table sélectionnée si elle ne correspond plus au nouveau nombre de convives
  useEffect(() => {
    if (selectedTableId) {
      const tableIsValid = filteredTables.some((t) => t.id === selectedTableId);
      if (!tableIsValid) {
        setSelectedTableId('');
      }
    }
  }, [guests, filteredTables, selectedTableId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId,
        client_name: clientName,
        phone: phone,
        order_type: fulfillmentType,
        table_id: fulfillmentType === 'sur_place' && selectedTableId ? selectedTableId : null,
        status: 'pending',
        total_amount: 0,
        // Décommentez et adaptez selon vos colonnes Supabase si elles existent :
        // reservation_date: date,
        // reservation_time: time,
        // guests_count: parseInt(guests, 10),
        // notes: specialRequest
      });

      if (error) throw error;

      setSuccess(true);
      setClientName('');
      setPhone('');
      setDate('');
      setTime('');
      setSelectedTableId('');
      setSpecialRequest('');
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#800020]/15 bg-white p-6 shadow-xl">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <span className="text-xs font-semibold text-[#800020] uppercase tracking-wider">Réservation & Commande</span>
        <h3 className="text-xl font-bold text-gray-900 mt-1">
          {restaurantName}
        </h3>
      </div>

      {success ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800 space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="font-bold text-lg">Réservation envoyée avec succès !</p>
          <p className="text-sm text-emerald-700">Le restaurant va valider votre demande sous peu.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
          >
            Faire une autre réservation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Choix du mode : Sur place / À emporter */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setFulfillmentType('sur_place')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                fulfillmentType === 'sur_place' ? 'bg-[#800020] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🍽️ Sur place
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType('a_emporter')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                fulfillmentType === 'a_emporter' ? 'bg-[#800020] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛍️ À emporter
            </button>
          </div>

          {/* Nombre de personnes (placé avant le choix de table pour filtrer dynamiquement) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
              Nombre de personnes
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none bg-white shadow-sm"
            >
              <option value="1">1 personne</option>
              <option value="2">2 personnes</option>
              <option value="3">3 personnes</option>
              <option value="4">4 personnes</option>
              <option value="5">5 personnes</option>
              <option value="6">6+ personnes</option>
            </select>
          </div>

          {/* Sélection de la table si "Sur place" avec filtrage intelligent */}
          {fulfillmentType === 'sur_place' && (
            <div className="bg-[#800020]/5 p-4 rounded-2xl border border-[#800020]/10 space-y-2">
              <label className="block text-xs font-semibold uppercase text-[#800020]">
                Sélectionner une table adaptée ({guests} pers. min)
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none bg-white shadow-sm"
                required={fulfillmentType === 'sur_place'}
              >
                <option value="">-- Choisissez une table disponible --</option>
                {filteredTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.number ? `N°${table.number} - ` : ''}{table.name} {table.capacity ? `(Capacité : ${table.capacity} pers.)` : ''}
                  </option>
                ))}
              </select>
              {filteredTables.length === 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  ⚠️ Aucune table disponible avec une capacité suffisante pour {guests} personnes.
                </p>
              )}
            </div>
          )}

          {/* Nom du client */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
              Votre Nom
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Manasse Swan"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none shadow-sm"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +243..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none shadow-sm"
              required
            />
          </div>

          {/* Grille Date & Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none shadow-sm"
                required
              />
            </div>
          </div>

          {/* Demande spéciale */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
              Demande spéciale (Optionnel)
            </label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Ex: Anniversaire, chaise haute, table en terrasse..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none resize-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#800020] py-4 text-center font-semibold text-white transition hover:bg-[#600018] disabled:opacity-50 shadow-md"
          >
            {loading ? 'Validation en cours...' : 'Confirmer la réservation'}
          </button>
        </form>
      )}
    </div>
  );
}