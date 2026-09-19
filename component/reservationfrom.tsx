'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Table {
  id: string;
  name: string;
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

  // Charger les tables disponibles pour ce restaurant
  useEffect(() => {
    async function fetchTables() {
      const { data, error } = await supabase
        .from('tables')
        .select('id, name, capacity')
        .eq('restaurant_id', restaurantId);

      if (!error && data) {
        setTables(data);
      }
    }

    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Enregistrement de la commande / réservation dans Supabase
      const { error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId,
        client_name: clientName,
        phone: phone,
        order_type: fulfillmentType,
        table_id: fulfillmentType === 'sur_place' && selectedTableId ? selectedTableId : null,
        status: 'pending',
        total_amount: 0, // Ajustez selon votre panier si nécessaire
        // Vous pouvez aussi stocker la date/heure/personnes si vos colonnes existent :
        // reservation_date: date,
        // reservation_time: time,
        // guests_count: guests,
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
    <div className="rounded-3xl border border-[#800020]/15 bg-white p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Réserver une table chez {restaurantName}
      </h3>

      {success ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center text-emerald-800">
          <p className="font-semibold">Réservation envoyée avec succès !</p>
          <p className="text-sm mt-1">Le restaurant va confirmer votre demande.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-xs font-bold underline text-[#800020]"
          >
            Faire une autre réservation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Choix du mode : Sur place / À emporter */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFulfillmentType('sur_place')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                fulfillmentType === 'sur_place' ? 'bg-[#800020] text-white shadow' : 'text-gray-600'
              }`}
            >
              Sur place
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType('a_emporter')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                fulfillmentType === 'a_emporter' ? 'bg-[#800020] text-white shadow' : 'text-gray-600'
              }`}
            >
              À emporter
            </button>
          </div>

          {/* Sélection de la table si "Sur place" */}
          {fulfillmentType === 'sur_place' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Choisir une table
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none bg-white"
                required={fulfillmentType === 'sur_place'}
              >
                <option value="">-- Sélectionnez une table --</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table : {table.name} {table.capacity ? `(${table.capacity} pers.)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nom du client */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Votre Nom
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Manasse Swan"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +243..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none"
              required
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Heure
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none"
              required
            />
          </div>

          {/* Nombre de personnes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Nombre de personnes
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none bg-white"
            >
              <option value="1">1 personne</option>
              <option value="2">2 personnes</option>
              <option value="3">3 personnes</option>
              <option value="4">4 personnes</option>
              <option value="5">5+ personnes</option>
            </select>
          </div>

          {/* Demande spéciale */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Demande spéciale (Optionnel)
            </label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Ex: Anniversaire, chaise haute, table en terrasse..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#800020] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#800020] py-3.5 text-center font-semibold text-white transition hover:bg-[#600018] disabled:opacity-50"
          >
            {loading ? 'Validation en cours...' : 'Confirmer la réservation'}
          </button>
        </form>
      )}
    </div>
  );
}