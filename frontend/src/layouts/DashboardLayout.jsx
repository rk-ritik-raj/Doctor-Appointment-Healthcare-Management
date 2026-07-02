import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  History,
  MessageSquare,
  User,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  Clock,
  Star,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    const patientLinks = [
      { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', path: '/dashboard/appointments', icon: Calendar },
      { name: 'Medical Records', path: '/dashboard/records', icon: ClipboardList },
      { name: 'Inbox Chat', path: '/dashboard/chat', icon: MessageSquare },
      { name: 'Profile Settings', path: '/dashboard/profile', icon: User },
    ];

    const doctorLinks = [
      { name: 'Practice Overview', path: '/doctor', icon: LayoutDashboard },
      { name: 'Appointments Manager', path: '/doctor/appointments', icon: Calendar },
      { name: 'Work Hours Availability', path: '/doctor/availability', icon: Clock },
      { name: 'Inbox Chat', path: '/doctor/chat', icon: MessageSquare },
      { name: 'Profile Settings', path: '/doctor/profile', icon: User },
    ];

    const adminLinks = [
      { name: 'Admin Analytics', path: '/admin', icon: LayoutDashboard },
      { name: 'Approve Doctors', path: '/admin/approvals', icon: ShieldCheck },
      { name: 'User Management', path: '/admin/users', icon: Users },
    ];

    if (user.role === 'admin') return adminLinks;
    if (user.role === 'doctor') return doctorLinks;
    return patientLinks;
  };

  const sidebarLinks = getLinks();

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-panel border-r border-white/20 dark:border-slate-800/50 shadow-md flex flex-col justify-between`}
      >
        <div className="pt-2">
          {/* Header Brand */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-slate-100 dark:border-slate-800/50">
            <Link to="/" className="flex items-center gap-2 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                M
              </div>
              {sidebarOpen && (
                <span className="font-poppins font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                  Medicare
                </span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:block"
            >
              <ChevronRight
                size={18}
                className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Links Section */}
          <nav className="px-3 py-6 space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary'
                      : 'text-customGray dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                  {sidebarOpen && <span className="truncate">{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="avatar"
              className="w-10 h-10 rounded-full border border-primary/20 object-cover shrink-0"
            />
            {sidebarOpen && (
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-sm truncate">{user.name}</h4>
                <p className="text-xs text-customGray capitalize truncate">{user.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-danger rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 text-danger rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 mt-4"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main
        className={`flex-grow transition-all duration-300 p-4 sm:p-8 min-h-screen overflow-x-hidden ${
          sidebarOpen ? 'pl-64' : 'pl-20 sm:pl-20'
        }`}
      >
        <div className="max-w-6xl mx-auto pt-16 sm:pt-0">
          {/* Mobile responsive sidebar hamburger toggle */}
          <div className="sm:hidden fixed top-3 left-4 z-50">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 glass-panel rounded-xl shadow-md text-slate-600 dark:text-slate-300"
            >
              <Menu size={20} />
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
