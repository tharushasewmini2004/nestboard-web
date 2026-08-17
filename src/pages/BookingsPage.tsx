import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { api, formatDate } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import type { Booking } from '@/types';

function Countdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const r = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(r);
      if (r <= 0) onExpire();
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const expired = remaining <= 0;

  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${expired ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-300'}`}>
      <Clock className="h-4 w-4" />
      {expired ? 'Payment window expired' : `Confirm within ${mins}:${String(secs).padStart(2, '0')}`}
    </span>
  );
}

export function BookingsPage() {
  const formatPrice = useFormatPrice();
  const location = useLocation();
  const confirmId = (location.state as { confirmId?: string } | null)?.confirmId;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBookings(await api.bookings.my());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    setActionError('');
    try {
      await api.bookings.confirm(id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Confirmation failed');
    } finally {
      setConfirming(null);
    }
  };

  const handleCancel = async (id: string) => {
    setConfirming(id);
    setActionError('');
    try {
      await api.bookings.cancel(id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nest-200 border-t-nest-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold dark:text-stone-100">My bookings</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Manage your co-living reservations and payments.</p>

      {error && <div className="alert-error mt-4">{error}</div>}
      {actionError && <div className="alert-error mt-4">{actionError}</div>}

      {bookings.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-stone-500 dark:text-stone-400">No bookings yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Browse properties</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => {
            const isPending = b.status === 'PENDING';
            const highlight = confirmId === b.id;
            const expired = isPending && new Date(b.paymentExpiresAt) < new Date();

            return (
              <article
                key={b.id}
                className={`card p-6 ${highlight ? 'ring-2 ring-nest-500' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                        {b.property?.title ?? 'Property'}
                      </h2>
                      <StatusBadge status={expired && isPending ? 'EXPIRED' : b.status} />
                    </div>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {b.roomType?.name} · Room {b.room?.label} · Seat {b.seatNumber}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5" /> {b.property?.city}
                    </p>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      {formatDate(b.leaseStart)} — {formatDate(b.leaseEnd)} ({b.durationMonths} mo)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-nest-700 dark:text-nest-400">{formatPrice(b.totalAmount).primary}</p>
                    <p className="text-xs text-stone-400">Booked {formatDate(b.createdAt)}</p>
                  </div>
                </div>

                {isPending && !expired && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/40">
                    <Countdown expiresAt={b.paymentExpiresAt} onExpire={load} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-secondary py-2"
                        disabled={confirming === b.id}
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary py-2"
                        disabled={confirming === b.id}
                        onClick={() => handleConfirm(b.id)}
                      >
                        {confirming === b.id ? 'Confirming…' : 'Confirm & pay'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
