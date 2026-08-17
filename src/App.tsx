import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AdminLayout } from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { HomePage } from '@/pages/HomePage';
import { MapPage } from '@/pages/MapPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { FavouritesPage } from '@/pages/FavouritesPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminProperties } from '@/pages/AdminProperties';
import { AdminBookings } from '@/pages/AdminBookings';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurrencyProvider>
        <FavouritesProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="bookings" element={<AdminBookings />} />
            </Route>

            <Route
              path="/*"
              element={
                <AppLayout>
                  <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="properties/:id" element={<PropertyDetailPage />} />
                    <Route path="bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                    <Route path="favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              }
            />
          </Routes>
          </BrowserRouter>
        </FavouritesProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
