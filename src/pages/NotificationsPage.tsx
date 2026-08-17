import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { api, formatDate } from '@/lib/api';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setNotifications(await api.notifications.list());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await api.notifications.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nest-200 border-t-nest-600" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold dark:text-stone-100">Notifications</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button type="button" className="btn-secondary" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {error && <div className="alert-error mt-4">{error}</div>}

      {notifications.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-stone-500 dark:text-stone-400">
          <Bell className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
          <p className="mt-4">No notifications yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card p-4 ${!n.read ? 'border-nest-200 bg-nest-50/50 dark:border-nest-800 dark:bg-nest-900/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{n.title}</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{n.message}</p>
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">{formatDate(n.createdAt)}</p>
                  {n.bookingId && (
                    <Link to="/bookings" className="mt-2 inline-block text-sm font-semibold text-nest-700 hover:underline dark:text-nest-400">
                      View booking →
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-nest-700 hover:underline dark:text-nest-400"
                    onClick={() => markRead(n.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
