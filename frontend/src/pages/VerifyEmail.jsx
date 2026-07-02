import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import { ShieldCheck, ShieldAlert, Loader } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  useEffect(() => {
    const triggerVerify = async () => {
      if (token) {
        const success = await verifyEmail(token);
        setStatus(success ? 'success' : 'error');
      } else {
        setStatus('error');
      }
    };
    
    triggerVerify();
  }, [token]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[70vh] flex items-center justify-center px-4"
    >
      <GlassCard hoverEffect={false} className="max-w-md w-full p-8 text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4 flex flex-col items-center">
            <Loader className="animate-spin text-primary" size={48} />
            <h2 className="text-xl font-bold">Verifying Email Address</h2>
            <p className="text-sm text-customGray">Please wait while we process your request...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-slate-800 dark:text-slate-100">Verification Successful</h2>
            <p className="text-sm text-customGray">Your email has been verified successfully. You can now access all services.</p>
            <Link
              to="/login"
              className="btn-primary w-full block text-center py-2.5 shadow-sm text-sm"
            >
              Sign In to Account
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-danger/15 text-danger flex items-center justify-center">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-2xl font-poppins font-bold text-slate-800 dark:text-slate-100">Verification Failed</h2>
            <p className="text-sm text-customGray">The link may have expired or is invalid. Please trigger a new verification link.</p>
            <Link
              to="/login"
              className="btn-secondary w-full block text-center py-2.5 text-sm"
            >
              Back to Login
            </Link>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default VerifyEmail;
