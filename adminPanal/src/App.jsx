import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Cart from './pages/Cart';
import BookingConfirm from './pages/BookingConfirm';
import BookingSuccess from './pages/BookingSuccess';
import Profile from './pages/Profile';
import Providers from './pages/Providers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import ProviderDetail from './pages/ProviderDetail';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/Categories';
import AdminServices from './pages/admin/ServicesAdmin';
import AdminUsers from './pages/admin/UsersAdmin';
import AdminCoupons from './pages/admin/CouponsAdmin';
import AdminBookings from './pages/admin/BookingsAdmin';
import AdminContent from './pages/admin/ContentAdmin';
import AdminReviews from './pages/admin/ReviewsAdmin';
import SystemSettings from './pages/admin/SystemSettings';

// Provider Pages
import ProviderLayout from './pages/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderBookings from './pages/provider/Bookings';
import ProviderServices from './pages/provider/Services';
import ProviderEarnings from './pages/provider/Earnings';
import ProviderReviews from './pages/provider/Reviews';
import ProviderProfile from './pages/provider/Profile';

// Layout wrapper for public pages
const PublicLayout = ({ children }) => {
  const location = useLocation();
  const hideNavFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <main>{children}</main>
      {!hideNavFooter && <Footer />}
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/providers" element={<PublicLayout><Providers /></PublicLayout>} />
      <Route path="/service/:id" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
      <Route path="/refund" element={<PublicLayout><RefundPolicy /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/provider-detail/:id" element={<PublicLayout><ProviderDetail /></PublicLayout>} />

      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Routes */}
      <Route path="/booking/confirm" element={
        <PublicLayout>
          <ProtectedRoute>
            <BookingConfirm />
          </ProtectedRoute>
        </PublicLayout>
      } />
      <Route path="/booking/success" element={
        <PublicLayout>
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        </PublicLayout>
      } />

      <Route path="/profile" element={
        <PublicLayout>
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </PublicLayout>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Provider Routes */}
      <Route path="/provider" element={
        <ProtectedRoute requiredRole="provider">
          <ProviderLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ProviderDashboard />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="earnings" element={<ProviderEarnings />} />
        <Route path="reviews" element={<ProviderReviews />} />
        <Route path="profile" element={<ProviderProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-xl text-gray-600 mt-4">Page not found</p>
            </div>
          </div>
        </PublicLayout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen transition-colors duration-300">
        <ScrollToTop />
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
