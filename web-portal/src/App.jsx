import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import CustomerPortal from './pages/CustomerPortal';
import AdminCRM from './pages/AdminCRM';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import HowToUse from './pages/HowToUse';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import Disclaimer from './pages/Disclaimer';

import AnnouncementBanner from './components/AnnouncementBanner';
import CorporateFooter from './components/CorporateFooter';

const PrivateRoleRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

function AppShell() {
  const location = useLocation();
  const showFooter = !['/', '/login'].includes(location.pathname) && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/customer') && !location.pathname.startsWith('/reset-password');

  return (
    <>
      <ScrollToTop />
      <AnnouncementBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/customer/*" element={<PrivateRoleRoute><CustomerPortal /></PrivateRoleRoute>} />
        <Route path="/admin/*" element={<PrivateRoleRoute requiredRole="admin"><AdminCRM /></PrivateRoleRoute>} />
      </Routes>
      {showFooter && <CorporateFooter />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
