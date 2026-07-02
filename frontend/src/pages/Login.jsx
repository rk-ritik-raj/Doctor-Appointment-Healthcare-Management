import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
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
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-[80px] -z-10"></div>

      <GlassCard hoverEffect={false} className="max-w-md w-full p-8 space-y-6">
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
            Welcome Back
          </h2>
          <p className="text-sm text-customGray">
            Sign in to manage appointments & healthcare records
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
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

          <CustomButton
            type="submit"
            loading={isSubmitting}
            className="w-full py-3 mt-6"
          >
            Sign In <ArrowRight size={18} />
          </CustomButton>
        </form>

        <p className="text-center text-sm text-customGray">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  );
};

export default Login;
