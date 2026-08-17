import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, Heart, Home, LayoutDashboard, LogIn, LogOut, Map, Menu, Moon, Sun, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-nest-50 text-nest-700 dark:bg-nest-900/50 dark:text-nest-300'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
  }`;

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    api.notifications.unreadCount()
      .then((r) => setUnread(r.count))
      .catch(() => setUnread(0));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = (
    <>
      <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>
        <Home className="h-4 w-4" /> Browse
      </NavLink>
      <NavLink to="/map" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        <Map className="h-4 w-4" /> Map
      </NavLink>
      {user && (
        <>
          <NavLink to="/bookings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            My Bookings
          </NavLink>
          <NavLink to="/favourites" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            <Heart className="h-4 w-4" /> Favourites
          </NavLink>
          <NavLink to="/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            <span className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            Alerts
          </NavLink>
          {user.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <LayoutDashboard className="h-4 w-4" /> Admin
            </NavLink>
          )}
        </>
      )}
    </>
  );

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg p-2 text-stone-600 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );

  const currencyToggleMobile = (
    <div className="flex rounded-lg border border-stone-200 p-0.5 text-[10px] font-semibold dark:border-stone-700 md:hidden">
      <button
        type="button"
        onClick={() => setCurrency('LKR')}
        className={`rounded-md px-2 py-1 transition ${currency === 'LKR' ? 'bg-nest-600 text-white' : 'text-stone-600 dark:text-stone-400'}`}
      >
        Rs
      </button>
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`rounded-md px-2 py-1 transition ${currency === 'USD' ? 'bg-nest-600 text-white' : 'text-stone-600 dark:text-stone-400'}`}
      >
        USD
      </button>
    </div>
  );

  const currencyToggle = (
    <div className="flex rounded-lg border border-stone-200 p-0.5 text-xs font-semibold dark:border-stone-700">
      <button
        type="button"
        onClick={() => setCurrency('LKR')}
        className={`rounded-md px-2.5 py-1.5 transition ${currency === 'LKR' ? 'bg-nest-600 text-white' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}
      >
        Rs
      </button>
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`rounded-md px-2.5 py-1.5 transition ${currency === 'USD' ? 'bg-nest-600 text-white' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}
      >
        USD
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nest-600 text-white">
            <Home className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-nest-800 dark:text-nest-300">NestBoard</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">{links}</nav>

        <div className="hidden items-center gap-2 md:flex">
          {currencyToggle}
          {themeToggle}
          {!loading && (
            user ? (
              <>
                <Link to="/profile" className="btn-secondary py-2">
                  <User className="h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Link>
                <button type="button" onClick={handleLogout} className="btn-secondary py-2">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2">
                  <LogIn className="h-4 w-4" /> Log in
                </Link>
                <Link to="/register" className="btn-primary py-2">Sign up</Link>
              </>
            )
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {currencyToggleMobile}
          {themeToggle}
          <button
            type="button"
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-950 md:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
            {!loading && (
              user ? (
                <>
                  <Link to="/profile" className="btn-secondary" onClick={() => setMobileOpen(false)}>Profile</Link>
                  <button type="button" className="btn-secondary" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" onClick={() => setMobileOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>Sign up</Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
