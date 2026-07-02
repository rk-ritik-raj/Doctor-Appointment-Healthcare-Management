import React from 'react';
import { motion } from 'framer-motion';
import { cardHover } from '../animations/variants';

const GlassCard = ({ children, className = '', hoverEffect = true, onClick }) => {
  const hoverProps = hoverEffect && onClick ? { whileHover: 'hover', variants: cardHover } : {};

  return (
    <motion.div
      {...hoverProps}
      onClick={onClick}
      className={`glass-panel rounded-3xl p-6 shadow-glass hover:shadow-glass-hover transition-shadow duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
