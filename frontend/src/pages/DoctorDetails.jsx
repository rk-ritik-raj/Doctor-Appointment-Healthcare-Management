import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Calendar, Clock, Award, ShieldAlert, Heart, Languages, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const docRes = await API.get(`/doctors/${id}`);
        setDoctor(docRes.data.data);
        
        const revRes = await API.get(`/reviews/doctor/${id}`);
        setReviews(revRes.data.data);

        // Check if doctor is in favorites if patient is logged in
        if (user && user.role === 'patient') {
          const patRes = await API.get('/patients/profile');
          const favs = patRes.data.data.favoriteDoctors || [];
          setIsFavorite(favs.includes(id));
        }
      } catch (e) {
        console.error(e);
        toast.error('Error fetching doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      return navigate('/login');
    }
    try {
      const res = await API.post('/patients/favorites', { doctorId: id });
      setIsFavorite(!isFavorite);
      toast.success(res.data.message);
    } catch (e) {
      console.error(e);
      toast.error('Could not toggle favorites');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in as a patient to book appointments');
      return navigate('/login');
    }
    if (user.role !== 'patient') {
      return toast.error('Only patient accounts can schedule bookings');
    }
    if (!selectedSlot) {
      return toast.error('Please select an available time slot');
    }

    setBookingLoading(true);
    try {
      // 1. Create Appointment (Pending Payment status)
      const apptRes = await API.post('/appointments/book', {
        doctorId: doctor.user._id,
        date: selectedDate,
        timeSlot: selectedSlot,
      });

      const appointmentId = apptRes.data.data._id;

      // 2. Initiate Stripe Checkout
      const payRes = await API.post('/payments/checkout-session', { appointmentId });
      
      if (payRes.data.mode === 'mock') {
        toast.success('Mock payment succeeded. Booking confirmed!');
        navigate('/dashboard?payment=success');
      } else {
        // Redirect to Stripe checkout url
        window.location.href = payRes.data.url;
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error processing payment session');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Doctor Profile Not Found</h2>
        <button onClick={() => navigate('/doctors')} className="btn-primary mt-4">Back to Doctors</button>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-16"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-2 text-sm text-customGray hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Doctor Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hoverEffect={false} className="p-8 flex flex-col md:flex-row gap-6 items-start">
            <img
              src={doctor.user.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doctor.user.name}`}
              alt={doctor.user.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border border-slate-100 shadow-sm shrink-0"
            />
            <div className="space-y-4 flex-grow w-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {doctor.specialization}
                  </span>
                  <h1 className="font-poppins font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100 mt-2">
                    Dr. {doctor.user.name}
                  </h1>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-2xl border transition-colors ${
                    isFavorite
                      ? 'bg-red-50 dark:bg-red-950/20 text-danger border-red-200 dark:border-red-900/30'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-danger'
                  }`}
                >
                  <Heart size={20} className={isFavorite ? 'fill-danger' : ''} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-customGray">
                <span className="flex items-center gap-1.5">
                  <Award size={16} className="text-primary" /> {doctor.experience} Years Experience
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" /> {doctor.rating.toFixed(1)} ({doctor.numReviews} Reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Languages size={16} className="text-primary" /> {doctor.languages.join(', ')}
                </span>
              </div>

              <p className="text-sm text-customGray leading-relaxed">{doctor.biography || 'No biography uploaded yet.'}</p>

              {user && user.role === 'patient' && (
                <CustomButton
                  onClick={() => navigate(`/dashboard/chat?peer=${doctor.user._id}`)}
                  variant="secondary"
                  className="text-xs px-4 py-2 border-slate-200"
                >
                  <MessageCircle size={14} /> Send Message
                </CustomButton>
              )}
            </div>
          </GlassCard>

          {/* Hospital/Clinic Details */}
          <GlassCard hoverEffect={false} className="p-6 space-y-4">
            <h2 className="font-poppins font-bold text-lg">Hospital & Clinic Details</h2>
            <div className="flex gap-3 items-start text-sm">
              <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{doctor.hospital.name}</h4>
                <p className="text-customGray mt-0.5">{doctor.hospital.address || 'Central Avenue Suite 10'}</p>
                <p className="text-customGray">{doctor.hospital.city}</p>
              </div>
            </div>
          </GlassCard>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="font-poppins font-bold text-lg">Patient Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-customGray">No reviews submitted for this doctor yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <GlassCard key={rev._id} hoverEffect={false} className="p-5 flex gap-4">
                    <img
                      src={rev.patient.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.patient.name}`}
                      alt="patient"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="space-y-2 flex-grow">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">{rev.patient.name}</h4>
                        <span className="flex items-center gap-0.5 text-xs font-semibold">
                          <Star size={12} className="fill-amber-400 text-amber-400" /> {rev.rating}
                        </span>
                      </div>
                      <p className="text-xs text-customGray leading-relaxed">{rev.comment}</p>
                      <div className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date and Time Booking Picker */}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="p-6 space-y-6 sticky top-24">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-customGray">Consultation Fee</span>
              <div className="text-3xl font-poppins font-extrabold text-primary mt-1">${doctor.consultationFee}</div>
            </div>

            {/* Date selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-customGray flex items-center gap-1">
                <Calendar size={14} /> 1. Select Date
              </label>
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-2 bg-white/50 dark:bg-slate-900/50">
                <ReactCalendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  minDate={new Date()}
                />
              </div>
            </div>

            {/* Slots selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-customGray flex items-center gap-1">
                <Clock size={14} /> 2. Select Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {doctor.availability.timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSlot === slot
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white/30 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <CustomButton
              onClick={handleCheckout}
              loading={bookingLoading}
              className="w-full py-3 mt-4"
            >
              Pay & Secure Appointment
            </CustomButton>

            <div className="flex gap-2 items-center text-[10px] text-customGray text-center justify-center pt-2">
              <Clock size={12} className="text-primary" /> Slots are real-time, vetted by Stripe card payments.
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorDetails;
