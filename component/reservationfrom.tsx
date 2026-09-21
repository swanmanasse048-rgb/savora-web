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
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const filteredTables = tables.filter((table) => {
    if (!table.capacity) return true;
    return table.capacity >= guests;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedTable = tables.find(t => t.id === selectedTableId);
      const tableName = selectedTable ? selectedTable.name : '';

      // Enregistrement dans la table 'reservations' avec 'guests' (conforme au schéma SQL)
      const { error } = await supabase.from('reservations').insert({
        restaurant_id: restaurantId,
        client_name: clientName,
        phone: phone,
        table_id: selectedTableId || null,
        status: 'pending',
        reservation_date: date || null,
        reservation_time: time || null,
        guests: guests, 
        special_request: specialRequest || null,
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
      <div className="mb-6 border-b border-gray-100 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#800020]">Réservation en ligne</span>
        <h3 className="text-xl font-extrabold text-gray-900 mt-1">
          Réserver chez {restaurantName}
        </h3>
      </div>

      {success ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-900 border border-emerald-100">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold text-lg">Réservation envoyée avec succès !</p>
          <p className="text-sm mt-1 text-emerald-700">Le restaurant a bien reçu votre demande et va la confirmer.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-5 inline-block rounded-full bg-[#800020] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#600018]"
          >
            Effectuer une autre réservation
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nom du client */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Votre Nom complet
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Manasse Swan"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-gray-50/50"
                required
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +243..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-gray-50/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-gray-50/50"
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
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-gray-50/50"
                required
              />
            </div>

            {/* Nombre de personnes */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Couverts (Personnes)
              </label>
              <select
                value={guests}
                onChange={(e) => {
                  setGuests(Number(e.target.value));
                  setSelectedTableId('');
                }}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-gray-50/50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} {num > 1 ? 'personnes' : 'personne'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sélection intelligente de la table */}
          <div className="rounded-2xl border border-dashed border-gray-300 p-4 bg-gray-50/30">
            <label className="block text-xs font-semibold uppercase text-[#800020] mb-1">
              Sélectionner une table adaptée ({guests} pers. min)
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none bg-white"
              required
            >
              <option value="">-- Choisissez une table libre --</option>
              {filteredTables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table : {table.name} {table.capacity ? `(Capacité : ${table.capacity} pers.)` : ''}
                </option>
              ))}
            </select>
            {filteredTables.length === 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⚠️ Aucune table enregistrée ne correspond à cette capacité exacte pour le moment. Veuillez contacter le restaurant.
              </p>
            )}
          </div>

          {/* Demande spéciale */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Demande spéciale (Optionnel)
            </label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Ex: Anniversaire, chaise haute pour enfant, table en terrasse..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 font-medium focus:border-[#800020] focus:outline-none resize-none bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#800020] py-4 text-center font-bold text-white transition hover:bg-[#600018] shadow-lg shadow-[#800020]/20 disabled:opacity-50"
          >
            {loading ? 'Validation en cours...' : 'Confirmer la réservation →'}
          </button>
        </form>
      )}
    </div>
  );
}