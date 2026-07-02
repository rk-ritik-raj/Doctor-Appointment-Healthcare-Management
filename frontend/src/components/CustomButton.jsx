import React from 'react';
import { motion } from 'framer-motion';
import { buttonRipple } from '../animations/variants';

const CustomButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'glass'
  className = '',
  disabled = false,
  loading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:brightness-105';
      case 'secondary':
        return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm';
      case 'danger':
        return 'bg-gradient-to-r from-danger to-red-600 text-white shadow-md hover:brightness-105';
      case 'glass':
        return 'glass-panel text-primary dark:text-accent hover:bg-white/90 shadow-sm';
      default:
        return '';
    }
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : 'hover'}
      whileTap={disabled || loading ? {} : 'tap'}
      variants={buttonRipple}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={`px-6 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
};

export default CustomButton;
