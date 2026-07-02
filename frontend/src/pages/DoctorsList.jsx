import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Search, MapPin, Star, Filter, Calendar, DollarSign, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DoctorsList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [availableToday, setAvailableToday] = useState(searchParams.get('availableToday') === 'true');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (city) params.city = city;
      if (experience) params.experience = experience;
      if (minRating) params.minRating = minRating;
      if (maxFee) params.maxFee = maxFee;
      if (availableToday) params.availableToday = 'true';

      const res = await API.get('/doctors', { params });
      setDoctors(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (specialization) params.specialization = specialization;
    if (city) params.city = city;
    if (experience) params.experience = experience;
    if (minRating) params.minRating = minRating;
    if (maxFee) params.maxFee = maxFee;
    if (availableToday) params.availableToday = 'true';

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('');
    setCity('');
    setExperience('');
    setMinRating('');
    setMaxFee('');
    setAvailableToday(false);
    setSearchParams({});
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-16"
    >
      <div className="space-y-2">
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-800 dark:text-slate-100">
          Find Certified Doctors
        </h1>
        <p className="text-customGray dark:text-slate-400">
          Search and book consultations with verified medical professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold flex items-center gap-2"><Filter size={18} /> Filters</span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-4">
              {/* Specialization */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-customGray">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="input-field py-2 text-sm bg-white dark:bg-slate-900"
                >
                  <option value="">All Specialities</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-customGray">Hospital City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-customGray" size={14} />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-customGray">Min Experience (Years)</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-customGray" size={14} />
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Max Consultation Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-customGray">Max Consult Fee ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-customGray" size={14} />
                  <input
                    type="number"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    placeholder="e.g. 150"
                    className="input-field pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-customGray">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="input-field py-2 text-sm bg-white dark:bg-slate-900"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="3">3.0+ Stars</option>
                </select>
              </div>

              {/* Available today */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={availableToday}
                  onChange={(e) => setAvailableToday(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-customGray flex items-center gap-1.5">
                  <Calendar size={14} /> Available Today
                </span>
              </label>

              <CustomButton type="submit" className="w-full text-sm mt-4">
                Apply Filters
              </CustomButton>
            </form>
          </GlassCard>
        </div>

        {/* Doctors Grid Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main search bar */}
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-customGray" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors by name or clinical keywords..."
                className="input-field pl-12 py-3 rounded-2xl"
              />
            </div>
            <CustomButton onClick={handleApplyFilters} className="rounded-2xl px-6">
              Search
            </CustomButton>
          </div>

          {loading ? (
            <LoadingSkeleton type="doctorCard" count={6} />
          ) : doctors.length === 0 ? (
            <GlassCard hoverEffect={false} className="p-12 text-center text-customGray">
              No doctors found matching the filter guidelines.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doctor) => (
                <GlassCard
                  key={doctor._id}
                  onClick={() => navigate(`/doctors/${doctor.user._id}`)}
                  className="p-6 flex flex-col justify-between border-slate-100/50"
                >
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <img
                        src={doctor.user.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doctor.user.name}`}
                        alt="avatar"
                        className="w-16 h-16 rounded-2xl object-cover border border-primary/10 shadow-sm"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {doctor.specialization}
                        </span>
                        <h3 className="font-poppins font-bold text-lg text-slate-800 dark:text-slate-100 mt-1">
                          Dr. {doctor.user.name}
                        </h3>
                        <p className="text-xs text-customGray flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {doctor.hospital.name}, {doctor.hospital.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm border-t border-b border-slate-100 dark:border-slate-800 py-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-customGray uppercase tracking-wider">Experience</span>
                        <span className="font-semibold">{doctor.experience} Years</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-customGray uppercase tracking-wider">Consult Fee</span>
                        <span className="font-semibold text-primary">${doctor.consultationFee}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-customGray uppercase tracking-wider">Rating</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Star size={14} className="fill-amber-400 text-amber-400" />{' '}
                          {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-customGray truncate max-w-[150px]">
                      Availability: {doctor.availability.days.slice(0, 3).join(', ')}...
                    </span>
                    <CustomButton variant="primary" className="text-xs px-4 py-2 shrink-0">
                      Book Now
                    </CustomButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorsList;
