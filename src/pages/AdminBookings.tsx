import { useEffect, useState } from 'react';
import { AdminCard, AdminPageShell } from '@/components/AdminLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatDate } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import type { Booking } from '@/types';

export function AdminBookings() {
  const formatPrice = useFormatPrice();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.bookings()
      .then(setBookings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageShell title="Bookings">
      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-700 border-t-nest-600" />
        </div>
      ) : bookings.length === 0 ? (
        <AdminCard><p className="text-stone-400">No bookings yet.</p></AdminCard>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <AdminCard key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{b.property?.title}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-400">
                    {b.tenantName ?? 'Guest'} · {b.roomType?.name} · Room {b.room?.label} · Seat {b.seatNumber}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDate(b.leaseStart)} — {formatDate(b.leaseEnd)}
                  </p>
                </div>
                <p className="font-display text-lg font-bold text-nest-400">{formatPrice(b.totalAmount).primary}</p>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
