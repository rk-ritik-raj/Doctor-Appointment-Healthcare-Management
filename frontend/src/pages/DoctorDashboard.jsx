import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Calendar, Check, X, Clock, Clipboard, FileText, User, Plus, Trash, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  // Tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'availability'
  
  // Data States
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Availability Settings
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Prescription Generator Overlay States
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', morning: false, afternoon: false, night: false, instructions: 'After food' }]);
  const [advice, setAdvice] = useState('');
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const apptRes = await API.get('/doctors/appointments');
      setAppointments(apptRes.data.data);

      const profileRes = await API.get('/doctors/profile');
      const doc = profileRes.data.data;
      setDoctorProfile(doc);
      setSelectedDays(doc.availability?.days || []);
      setSelectedSlots(doc.availability?.timeSlots || []);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching clinical stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await API.put(`/appointments/${apptId}/status`, { status: newStatus });
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchDoctorData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = () => {
    if (newSlotTime && !selectedSlots.includes(newSlotTime)) {
      setSelectedSlots([...selectedSlots, newSlotTime]);
      setNewSlotTime('');
    }
  };

  const handleRemoveSlot = (slot) => {
    setSelectedSlots(selectedSlots.filter((s) => s !== slot));
  };

  const handleSaveAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      await API.put('/doctors/availability', {
        days: selectedDays,
        timeSlots: selectedSlots,
      });
      toast.success('Availability schedule saved!');
      fetchDoctorData();
    } catch (e) {
      toast.error('Failed to update availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Medicine Builder
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', morning: false, afternoon: false, night: false, instructions: 'After food' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setPrescriptionLoading(true);
    try {
      const payload = {
        appointmentId: selectedAppointmentId,
        diagnosis,
        medicines: medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: {
            morning: m.morning,
            afternoon: m.afternoon,
            night: m.night,
          },
          instructions: m.instructions,
        })),
        advice,
      };

      await API.post('/prescriptions', payload);
      toast.success('Prescription generated. Appointment completed.');
      setPrescriptionModalOpen(false);
      setDiagnosis('');
      setMedicines([{ name: '', dosage: '', morning: false, afternoon: false, night: false, instructions: 'After food' }]);
      setAdvice('');
      fetchDoctorData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving prescription');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const upcomingAppointments = appointments.filter((a) => a.status === 'approved');
  const pastAppointments = appointments.filter((a) => ['completed', 'cancelled'].includes(a.status));
  
  // Earnings Calculator
  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((acc, appt) => acc + (appt.amountPaid || 0), 0);

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
            Clinical Center, Dr. {user.name}
          </h1>
          <p className="text-sm text-customGray">Review checkups, schedules, and earnings.</p>
        </div>

        {/* Dash Nav links */}
        <div className="flex gap-2 p-1 glass-panel rounded-2xl">
          {['overview', 'appointments', 'availability'].map((tab) => (
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
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings card */}
              <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-primary">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">${totalRevenue}</h3>
                  <p className="text-xs text-customGray font-medium uppercase tracking-wider">Total Platform Revenue</p>
                </div>
              </GlassCard>

              {/* Total Checkups card */}
              <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4 border-l-4 border-success">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <Clipboard size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">
                    {appointments.filter((a) => a.status === 'completed').length}
                  </h3>
                  <p className="text-xs text-customGray font-medium uppercase tracking-wider">Completed Consultations</p>
                </div>
              </GlassCard>
            </div>

            {/* Pending Requests list */}
            <div className="space-y-4">
              <h2 className="font-poppins font-bold text-lg">Pending Consultation Requests</h2>
              {pendingAppointments.length === 0 ? (
                <GlassCard hoverEffect={false} className="p-6 text-center text-customGray">
                  No pending patient requests.
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.map((appt) => (
                    <GlassCard key={appt._id} hoverEffect={false} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <img
                          src={appt.patient.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${appt.patient.name}`}
                          alt="patient"
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{appt.patient.name}</h4>
                          <p className="text-xs text-customGray">Requested Slot: {new Date(appt.date).toLocaleDateString()} - {appt.timeSlot}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <CustomButton
                          onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                          variant="secondary"
                          className="text-xs px-4 py-2 border-red-200 text-danger hover:bg-red-50"
                        >
                          Reject
                        </CustomButton>
                        <CustomButton
                          onClick={() => handleUpdateStatus(appt._id, 'approved')}
                          variant="primary"
                          className="text-xs px-4 py-2"
                        >
                          Approve Slot
                        </CustomButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <GlassCard hoverEffect={false} className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Vetting Vitals</h3>
              <p className="text-xs text-customGray">Approved doctors will appear on Medicare search indices. If pending review, allow up to 24 hours.</p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Vetting status:</span>
                  <span className={`font-semibold capitalize px-2.5 py-0.5 rounded-full text-xs ${
                    doctorProfile.isApproved === 'approved' 
                      ? 'bg-success/10 text-success' 
                      : doctorProfile.isApproved === 'rejected' 
                      ? 'bg-danger/10 text-danger' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {doctorProfile.isApproved}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <h2 className="font-poppins font-bold text-xl">My Consultations</h2>
          {appointments.length === 0 ? (
            <GlassCard hoverEffect={false} className="p-12 text-center text-customGray">
              No appointments registered.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((appt) => (
                <GlassCard key={appt._id} hoverEffect={false} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={appt.patient.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${appt.patient.name}`}
                      alt="patient"
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">Patient: {appt.patient.name}</h3>
                      <p className="text-xs text-customGray">
                        {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot} | Fee: ${appt.amountPaid} | Paid: {appt.paymentStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {appt.status === 'approved' && (
                      <CustomButton
                        onClick={() => {
                          setSelectedAppointmentId(appt._id);
                          setPrescriptionModalOpen(true);
                        }}
                        variant="primary"
                        className="text-xs px-4 py-2"
                      >
                        Write Prescription
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

      {activeTab === 'availability' && (
        <GlassCard hoverEffect={false} className="p-8 space-y-6">
          <h2 className="font-poppins font-bold text-xl border-b border-slate-100 dark:border-slate-800 pb-3">
            Clinic Work Hours & Slots
          </h2>

          {/* Days selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray">Days Available</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isActive = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white/30 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Selector */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray block">Clinical Slots</label>
            
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 02:00 PM"
                className="input-field py-2 text-xs"
              />
              <CustomButton onClick={handleAddSlot} variant="secondary" className="px-4 py-2 text-xs">
                <Plus size={16} /> Add Slot
              </CustomButton>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedSlots.length === 0 ? (
                <p className="text-xs text-customGray">No slots configured.</p>
              ) : (
                selectedSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-danger hover:bg-red-50 p-0.5 rounded-full"
                    >
                      <Trash size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="pt-4">
            <CustomButton
              onClick={handleSaveAvailability}
              loading={availabilityLoading}
              className="px-6 py-2.5 text-xs"
            >
              Save Schedule
            </CustomButton>
          </div>
        </GlassCard>
      )}

      {/* Prescription Generator Modal Overlay */}
      <AnimatePresence>
        {prescriptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl p-6 glass-panel-heavy rounded-3xl space-y-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setPrescriptionModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>

              <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">Prescription Generator</h3>

              <form onSubmit={handleSavePrescription} className="space-y-6">
                {/* Diagnosis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-customGray">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis"
                    className="input-field"
                    required
                  />
                </div>

                {/* Medicines List Builder */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-customGray">Medicines / Pills</label>
                    <CustomButton
                      type="button"
                      onClick={handleAddMedicine}
                      variant="secondary"
                      className="px-3 py-1.5 text-xs rounded-lg border-slate-200"
                    >
                      <Plus size={14} /> Add Medicine
                    </CustomButton>
                  </div>

                  <div className="space-y-3">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 relative">
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="absolute top-2 right-2 text-danger hover:bg-red-50 p-1 rounded-lg"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                              placeholder="Medicine Name"
                              className="input-field text-xs py-2"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                              placeholder="Dosage (e.g. 500mg)"
                              className="input-field text-xs py-2"
                              required
                            />
                          </div>
                        </div>

                        {/* Frequency Toggles */}
                        <div className="flex items-center gap-6">
                          <span className="text-xs font-semibold text-customGray">Frequency:</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={med.morning}
                              onChange={(e) => handleMedicineChange(idx, 'morning', e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4.5 h-4.5"
                            />
                            Morning (☀️)
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={med.afternoon}
                              onChange={(e) => handleMedicineChange(idx, 'afternoon', e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4.5 h-4.5"
                            />
                            Afternoon (🌤️)
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={med.night}
                              onChange={(e) => handleMedicineChange(idx, 'night', e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-4.5 h-4.5"
                            />
                            Night (🌙)
                          </label>
                        </div>

                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          placeholder="Special instructions (e.g. After food)"
                          className="input-field text-xs py-2 mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-customGray">Advice & Directives</label>
                  <textarea
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="e.g. Take bed rest for 3 days and avoid oily food."
                    rows={3}
                    className="input-field text-xs"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <CustomButton
                    type="button"
                    onClick={() => setPrescriptionModalOpen(false)}
                    variant="secondary"
                    className="w-1/2 text-xs"
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    loading={prescriptionLoading}
                    className="w-1/2 text-xs"
                  >
                    Save & Complete Consultation
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

export default DoctorDashboard;
