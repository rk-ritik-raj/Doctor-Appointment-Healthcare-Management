import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Stethoscope, Building, FileDigit } from 'lucide-react';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: 'patient',
    },
  });

  const handleNextStep = async () => {
    const fieldsToValidate = ['name', 'email', 'password'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    try {
      let doctorDetails;
      if (role === 'doctor') {
        doctorDetails = {
          specialization: data.specialization,
          experience: Number(data.experience),
          consultationFee: Number(data.consultationFee),
          qualifications: data.qualifications ? data.qualifications.split(',') : ['MBBS'],
          hospital: {
            name: data.hospitalName,
            city: data.hospitalCity,
            address: data.hospitalAddress,
          },
        };
      }
      
      await registerAuth(data.name, data.email, data.password, role, doctorDetails);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-[80px] -z-10"></div>

      <GlassCard hoverEffect={false} className="max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <span className="font-poppins font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Medicare
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-slate-800 dark:text-slate-100">
            Create Account
          </h2>
          <p className="text-sm text-customGray">
            Register to schedule appointments & manage medical logs
          </p>
        </div>

        {/* Role Toggle Selector */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 p-1.5 glass-panel rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                role === 'patient'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Patient Signup
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                role === 'doctor'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Doctor Signup
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-customGray" size={18} />
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Jane Doe"
                      className={`input-field pl-11 ${errors.name ? 'border-danger focus:ring-danger/25' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-xs text-danger font-medium pl-1">{errors.name.message}</span>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-customGray" size={18} />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="you@example.com"
                      className={`input-field pl-11 ${errors.email ? 'border-danger focus:ring-danger/25' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-xs text-danger font-medium pl-1">{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-customGray" size={18} />
                    <input
                      type="password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      placeholder="••••••••"
                      className={`input-field pl-11 ${errors.password ? 'border-danger focus:ring-danger/25' : ''}`}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-xs text-danger font-medium pl-1">{errors.password.message}</span>
                  )}
                </div>

                {role === 'doctor' ? (
                  <CustomButton
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3 mt-6"
                  >
                    Clinical Information <ArrowRight size={18} />
                  </CustomButton>
                ) : (
                  <CustomButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-full py-3 mt-6"
                  >
                    Register Account <ArrowRight size={18} />
                  </CustomButton>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-customGray" size={18} />
                    <select
                      {...register('specialization', { required: 'Specialization is required' })}
                      className="input-field pl-11 appearance-none bg-white dark:bg-slate-900"
                    >
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
                </div>

                {/* Experience & Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience (Years)</label>
                    <input
                      type="number"
                      {...register('experience', { required: 'Required', min: 0 })}
                      placeholder="5"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Consultation Fee ($)</label>
                    <input
                      type="number"
                      {...register('consultationFee', { required: 'Required', min: 0 })}
                      placeholder="100"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Qualifications (Comma separated)</label>
                  <div className="relative">
                    <FileDigit className="absolute left-3.5 top-1/2 -translate-y-1/2 text-customGray" size={18} />
                    <input
                      type="text"
                      {...register('qualifications', { required: 'Required' })}
                      placeholder="MBBS, MD Cardiology"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {/* Hospital Details */}
                <div className="space-y-3 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-customGray">Clinic / Hospital Location</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      {...register('hospitalName', { required: 'Hospital Name required' })}
                      placeholder="Clinic Name"
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      {...register('hospitalCity', { required: 'City required' })}
                      placeholder="City"
                      className="input-field text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    {...register('hospitalAddress')}
                    placeholder="Full Address"
                    className="input-field text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <CustomButton
                    type="button"
                    onClick={() => setStep(1)}
                    variant="secondary"
                    className="w-1/2"
                  >
                    Back
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-1/2"
                  >
                    Register <ShieldCheck size={18} />
                  </CustomButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-sm text-customGray">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login Here
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  );
};

export default Register;
