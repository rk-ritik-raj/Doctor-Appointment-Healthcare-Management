import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Calendar, FileText, Activity, AlertCircle, X, Check, Star, RefreshCw, Scale, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'records', 'profile'
  
  // Data States
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDoctorForReview, setSelectedDoctorForReview] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // BMI States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apptRes = await API.get('/patients/appointments');
      setAppointments(apptRes.data.data);

      const profRes = await API.get('/patients/profile');
      setProfile(profRes.data.data);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (paymentStatus === 'success') {
      toast.success('Payment successfully processed! Appointment approved.');
    }
  }, [paymentStatus]);

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await API.put(`/appointments/${apptId}/status`, { status: 'cancelled' });
        toast.success('Appointment cancelled successfully');
        fetchDashboardData();
      } catch (e) {
        toast.error('Could not cancel appointment');
      }
    }
  };

  const handleCalculateBMI = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const bmi = w / (h * h);
      let category = 'Normal';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
      else if (bmi >= 30) category = 'Obese';
      
      setBmiResult({ bmi: bmi.toFixed(1), category });
    }
  };

  const handlePrintPrescription = (pres) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - Medicare</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563EB; }
            .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .meta div { font-size: 14px; line-height: 1.6; }
            .section-title { font-size: 16px; font-weight: bold; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; color: #2563EB; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
            th { bg-color: #f8fafc; font-weight: bold; }
            .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Medicare Prescription</div>
              <div>Certified Medical Practice</div>
            </div>
            <div style="text-align: right;">
              <div>Date: ${new Date(pres.date).toLocaleDateString()}</div>
              <div>ID: ${pres._id.substring(0, 8).toUpperCase()}</div>
            </div>
          </div>
          
          <div class="meta">
            <div>
              <strong>Doctor Details:</strong><br/>
              Dr. ${pres.doctor.name}<br/>
              ${pres.doctor.specialization || 'Consultant'}<br/>
              ${pres.doctor.hospital?.name || ''}
            </div>
            <div>
              <strong>Patient Details:</strong><br/>
              Name: ${pres.patient.name}<br/>
              Email: ${pres.patient.email}<br/>
            </div>
          </div>
          
          <div class="section-title">DIAGNOSIS</div>
          <p style="font-size: 14px; line-height: 1.6;">${pres.diagnosis}</p>
          
          <div class="section-title">MEDICATIONS</div>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${pres.medicines.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.dosage}</td>
                  <td>
                    ${m.frequency.morning ? 'Morning (☀️) ' : ''}
                    ${m.frequency.afternoon ? 'Afternoon (🌤️) ' : ''}
                    ${m.frequency.night ? 'Night (🌙)' : ''}
                  </td>
                  <td>${m.instructions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${pres.advice ? `
            <div class="section-title">ADVICE & GUIDELINES</div>
            <p style="font-size: 14px; line-height: 1.6;">${pres.advice}</p>
          ` : ''}
          
          <div class="footer">
            <p>This is a digitally generated medical record verified via Medicare JWT verification.</p>
            <p>&copy; ${new Date().getFullYear()} Medicare Platform. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await API.post('/reviews', {
        doctorId: selectedDoctorForReview,
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      setReviewModalOpen(false);
      setComment('');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((a) => ['pending', 'approved'].includes(a.status));
  const pastAppointments = appointments.filter((a) => ['completed', 'cancelled'].includes(a.status));

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
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-customGray">Manage appointments, health analytics and records.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 glass-panel rounded-2xl">
          {['overview', 'appointments', 'records'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                  : 'text-customGray hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-primary">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">{upcomingAppointments.length}</h3>
                  <p className="text-xs text-customGray font-medium uppercase tracking-wider">Scheduled Consultations</p>
                </div>
              </GlassCard>

              <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-success">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">
                    {appointments.filter((a) => a.prescription).length}
                  </h3>
                  <p className="text-xs text-customGray font-medium uppercase tracking-wider">Active Prescriptions</p>
                </div>
              </GlassCard>
            </div>

            {/* Upcoming appts preview */}
            <div className="space-y-4">
              <h2 className="font-poppins font-bold text-lg">Next Appointment</h2>
              {upcomingAppointments.length === 0 ? (
                <GlassCard hoverEffect={false} className="p-6 text-center text-customGray">
                  No upcoming consultations.
                </GlassCard>
              ) : (
                <GlassCard hoverEffect={false} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={upcomingAppointments[0].doctor.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${upcomingAppointments[0].doctor.name}`}
                      alt="doctor"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase">
                        {upcomingAppointments[0].doctor.specialization || 'Clinical'}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mt-1">Dr. {upcomingAppointments[0].doctor.name}</h4>
                      <p className="text-xs text-customGray">{new Date(upcomingAppointments[0].date).toLocaleDateString()} - {upcomingAppointments[0].timeSlot}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <CustomButton
                      onClick={() => handleCancelAppointment(upcomingAppointments[0]._id)}
                      variant="secondary"
                      className="text-xs px-4 py-2 border-red-200 text-danger hover:bg-red-50"
                    >
                      Cancel
                    </CustomButton>
                    <span className="px-4 py-2 text-xs font-semibold capitalize rounded-full glass-panel text-amber-500 border-amber-200">
                      {upcomingAppointments[0].status}
                    </span>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>

          {/* BMI Calculator Widget */}
          <div className="lg:col-span-1">
            <GlassCard hoverEffect={false} className="p-6 space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Scale className="text-primary" size={20} /> BMI Calculator
              </h3>
              <form onSubmit={handleCalculateBMI} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-customGray">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-customGray">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>
                <CustomButton type="submit" className="w-full text-xs py-2.5">
                  Calculate BMI
                </CustomButton>
              </form>

              {bmiResult && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1 animate-fadeIn">
                  <div className="text-2xl font-extrabold text-primary">{bmiResult.bmi}</div>
                  <div className="text-xs font-semibold uppercase text-customGray">Category: {bmiResult.category}</div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <h2 className="font-poppins font-bold text-xl">Consultation History</h2>
          
          {appointments.length === 0 ? (
            <GlassCard hoverEffect={false} className="p-12 text-center text-customGray">
              No appointments scheduled yet.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((appt) => (
                <GlassCard key={appt._id} hoverEffect={false} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={appt.doctor.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${appt.doctor.name}`}
                      alt="doctor"
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {appt.doctor.specialization || 'Cardiology'}
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-1">Dr. {appt.doctor.name}</h3>
                      <p className="text-xs text-customGray">{new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {appt.status === 'completed' && !appt.reviewed && (
                      <CustomButton
                        onClick={() => {
                          setSelectedDoctorForReview(appt.doctor._id);
                          setReviewModalOpen(true);
                        }}
                        variant="secondary"
                        className="text-xs px-4 py-2"
                      >
                        Submit Review
                      </CustomButton>
                    )}

                    {appt.status === 'completed' && appt.prescription && (
                      <CustomButton
                        onClick={() => handlePrintPrescription(appt.prescription)}
                        variant="glass"
                        className="text-xs px-4 py-2"
                      >
                        Print Prescription
                      </CustomButton>
                    )}

                    {['pending', 'approved'].includes(appt.status) && (
                      <CustomButton
                        onClick={() => handleCancelAppointment(appt._id)}
                        variant="secondary"
                        className="text-xs px-4 py-2 border-red-150 text-danger hover:bg-red-50"
                      >
                        Cancel
                      </CustomButton>
                    )}

                    <span
                      className={`px-4 py-2 text-xs font-semibold capitalize rounded-full border ${
                        appt.status === 'completed'
                          ? 'bg-success/10 border-success/20 text-success'
                          : appt.status === 'cancelled'
                          ? 'bg-danger/10 border-danger/20 text-danger'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-6">
          <h2 className="font-poppins font-bold text-xl">My Prescriptions</h2>
          
          {appointments.filter((a) => a.prescription).length === 0 ? (
            <GlassCard hoverEffect={false} className="p-12 text-center text-customGray">
              No prescriptions uploaded yet. Prescriptions appear here once appointments are completed.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments
                .filter((a) => a.prescription)
                .map((appt) => (
                  <GlassCard key={appt._id} hoverEffect={false} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">
                        Diagnosis: {appt.prescription.diagnosis}
                      </h4>
                      <p className="text-xs text-customGray">
                        Prescribed by Dr. {appt.doctor.name} on {new Date(appt.prescription.date).toLocaleDateString()}
                      </p>
                    </div>

                    <CustomButton
                      onClick={() => handlePrintPrescription(appt.prescription)}
                      variant="primary"
                      className="text-xs px-4 py-2"
                    >
                      Download & Print Prescription
                    </CustomButton>
                  </GlassCard>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal UI overlay */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 glass-panel-heavy rounded-3xl space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>

              <h3 className="font-bold text-lg">Doctor Feedback</h3>
              <p className="text-xs text-customGray">Provide rating stars and advice based on your medical experience.</p>
              
              <form onSubmit={submitReview} className="space-y-4">
                {/* Rating Select */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-customGray">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setRating(stars)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={stars <= rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-customGray">Comments</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write details of the consultation checkup..."
                    rows={4}
                    className="input-field"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <CustomButton
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    variant="secondary"
                    className="w-1/2 text-xs"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    loading={reviewLoading}
                    className="w-1/2 text-xs"
                  >
                    Submit Review
                  </CustomButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientDashboard;
