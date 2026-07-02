import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import DoctorsList from './pages/DoctorsList';
import DoctorDetails from './pages/DoctorDetails';
import AIChecker from './pages/AIChecker';
import About from './pages/About';
import Contact from './pages/Contact';

// Private Dashboards
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatInbox from './pages/ChatInbox';

const queryClient = new QueryClient();

// Shell helper to inject navbar/footer on public pages only
const ContentWrapper = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/doctor') || 
                      location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && <Navbar />}
      <div className={`flex-grow ${!isDashboard ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full' : ''}`}>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/ai-checker" element={<AIChecker />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Patient Dashboard Routing */}
          <Route path="/dashboard/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<PatientDashboard />} />
                <Route path="/appointments" element={<PatientDashboard />} />
                <Route path="/records" element={<PatientDashboard />} />
                <Route path="/chat" element={<ChatInbox />} />
                <Route path="/profile" element={<PatientDashboard />} />
              </Routes>
            </DashboardLayout>
          } />

          {/* Doctor Dashboard Routing */}
          <Route path="/doctor/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DoctorDashboard />} />
                <Route path="/appointments" element={<DoctorDashboard />} />
                <Route path="/availability" element={<DoctorDashboard />} />
                <Route path="/chat" element={<ChatInbox />} />
                <Route path="/profile" element={<DoctorDashboard />} />
              </Routes>
            </DashboardLayout>
          } />

          {/* Admin Dashboard Routing */}
          <Route path="/admin/*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/approvals" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminDashboard />} />
              </Routes>
            </DashboardLayout>
          } />
        </Routes>
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ContentWrapper />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
