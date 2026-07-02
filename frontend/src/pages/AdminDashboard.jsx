import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldAlert, Users, Award, DollarSign, Calendar, Check, X, Ban, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'approvals'
  
  // Data States
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await API.get('/admin/dashboard');
      setStats(statsRes.data.data.stats);
      setChartData(statsRes.data.data.chartData);

      const approvalsRes = await API.get('/admin/doctors/pending');
      setPendingDoctors(approvalsRes.data.data);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDecision = async (doctorId, decision) => {
    try {
      await API.put(`/admin/doctors/${doctorId}/approve`, { decision });
      toast.success(`Doctor application was successfully ${decision}!`);
      fetchAdminData();
    } catch (e) {
      toast.error('Could not log doctor vetting decision');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Chart configs
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const patientTrendData = chartData ? {
    labels: chartData.registrationTrends.map((t) => t.month),
    datasets: [
      {
        label: 'New Patients',
        data: chartData.registrationTrends.map((t) => t.registrations),
        backgroundColor: '#2563EB',
        borderRadius: 8,
      },
    ],
  } : null;

  const apptBreakdownData = chartData ? {
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          chartData.appointmentsBreakdown.pending,
          chartData.appointmentsBreakdown.approved,
          chartData.appointmentsBreakdown.completed,
          chartData.appointmentsBreakdown.cancelled,
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444'],
        borderWidth: 0,
      },
    ],
  } : null;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-16"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="font-poppins font-bold text-3xl text-slate-800 dark:text-slate-100">
            Platform Command Center
          </h1>
          <p className="text-sm text-customGray">Vet providers, moderate review cards, and view metrics.</p>
        </div>

        {/* Dash Nav tabs */}
        <div className="flex gap-2 p-1 glass-panel rounded-2xl">
          {['overview', 'approvals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                  : 'text-customGray hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'overview' ? 'Telemetry Metrics' : 'Doctor Approvals'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-primary">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{stats?.totalPatients}</h3>
                <p className="text-[10px] text-customGray font-bold uppercase tracking-wider">Patients Registered</p>
              </div>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-success">
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{stats?.totalDoctors}</h3>
                <p className="text-[10px] text-customGray font-bold uppercase tracking-wider">Practitioners Listed</p>
              </div>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-amber-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{stats?.totalAppointments}</h3>
                <p className="text-[10px] text-customGray font-bold uppercase tracking-wider">Total Consults</p>
              </div>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">${stats?.totalRevenue}</h3>
                <p className="text-[10px] text-customGray font-bold uppercase tracking-wider">Gross Revenue</p>
              </div>
            </GlassCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlassCard hoverEffect={false} className="p-6 lg:col-span-2 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Activity className="text-primary" size={20} /> Patient Growth Trend (Monthly)
              </h3>
              <div className="h-64 flex items-center justify-center">
                {patientTrendData && <Bar data={patientTrendData} options={barOptions} />}
              </div>
            </GlassCard>

            <GlassCard hoverEffect={false} className="p-6 lg:col-span-1 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldAlert className="text-primary" size={20} /> Appointments Status
              </h3>
              <div className="h-64 flex items-center justify-center">
                {apptBreakdownData && <Doughnut data={apptBreakdownData} options={{ responsive: true, cutout: '70%' }} />}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <h2 className="font-poppins font-bold text-xl">Vetting Queue ({pendingDoctors.length})</h2>
          
          {pendingDoctors.length === 0 ? (
            <GlassCard hoverEffect={false} className="p-12 text-center text-customGray">
              No doctors awaiting verification.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingDoctors.map((doc) => (
                <GlassCard key={doc._id} hoverEffect={false} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-4 items-start">
                    <img
                      src={doc.user.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.user.name}`}
                      alt="avatar"
                      className="w-14 h-14 rounded-2xl object-cover border shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {doc.specialization}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">Dr. {doc.user.name}</h4>
                      <p className="text-xs text-customGray">Hospital: {doc.hospital.name}, {doc.hospital.city}</p>
                      <p className="text-xs text-customGray">Qualifications: {doc.qualifications.join(', ')}</p>
                      <p className="text-xs text-customGray">Consultation Fee: ${doc.consultationFee}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <CustomButton
                      onClick={() => handleDecision(doc._id, 'rejected')}
                      variant="secondary"
                      className="text-xs px-4 py-2 border-red-200 text-danger hover:bg-red-50"
                    >
                      <X size={14} /> Reject
                    </CustomButton>
                    <CustomButton
                      onClick={() => handleDecision(doc._id, 'approved')}
                      variant="primary"
                      className="text-xs px-4 py-2"
                    >
                      <Check size={14} /> Verify Credentials
                    </CustomButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
