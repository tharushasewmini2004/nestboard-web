import { useEffect, useState } from 'react';
import { AdminPageShell, AdminStat } from '@/components/AdminLayout';
import { api } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import type { AdminStats } from '@/types';

export function AdminDashboard() {
  const formatPrice = useFormatPrice();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.stats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load stats'));
  }, []);

  return (
    <AdminPageShell title="Dashboard">
      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">{error}</div>
      )}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <AdminStat label="Properties" value={stats.properties} />
          <AdminStat label="Total bookings" value={stats.bookings} />
          <AdminStat label="Pending" value={stats.pendingBookings} />
          <AdminStat label="Confirmed" value={stats.confirmedBookings} />
          <AdminStat label="Revenue" value={formatPrice(stats.revenue).primary} />
        </div>
      ) : !error && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-700 border-t-nest-600" />
        </div>
      )}
    </AdminPageShell>
  );
}
