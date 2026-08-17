import type { BookingStatus } from '@/types';

const styles: Record<BookingStatus, string> = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  CANCELLED: 'badge-cancelled',
  EXPIRED: 'badge-expired',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={styles[status]}>{status}</span>;
}
