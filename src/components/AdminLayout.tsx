import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Building2, CalendarDays, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-nest-600 text-white'
      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
  }`;

export function AdminLayout() {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-stone-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-800 bg-stone-900 p-4 md:flex">
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-nest-400">NestBoard</p>
          <h2 className="font-display text-lg font-bold text-white">Admin Panel</h2>
          <p className="mt-1 text-xs text-stone-500">{user.name}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/admin" end className={sidebarLink}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/admin/properties" className={sidebarLink}>
            <Building2 className="h-4 w-4" /> Properties
          </NavLink>
          <NavLink to="/admin/bookings" className={sidebarLink}>
            <CalendarDays className="h-4 w-4" /> Bookings
          </NavLink>
        </nav>

        <div className="border-t border-stone-800 pt-4">
          <NavLink to="/" className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-400 hover:bg-stone-800 hover:text-white">
            ← Back to site
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <div className="border-b border-stone-800 bg-stone-900 px-4 py-3 md:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            <NavLink to="/admin" end className={sidebarLink}>Dashboard</NavLink>
            <NavLink to="/admin/properties" className={sidebarLink}>Properties</NavLink>
            <NavLink to="/admin/bookings" className={sidebarLink}>Bookings</NavLink>
          </nav>
        </div>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white md:text-3xl">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-stone-800 bg-stone-900 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function AdminStat({ label, value }: { label: string; value: string | number }) {
  return (
    <AdminCard>
      <p className="text-sm text-stone-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
    </AdminCard>
  );
}
