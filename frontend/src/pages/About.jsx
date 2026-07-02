import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition, containerVariants, itemVariants } from '../animations/variants';
import { Heart, ShieldCheck, Star, Users } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const About = () => {
  const values = [
    { title: 'Vision', desc: 'To provide instant, affordable medical checkups and clinical consulting globally.', icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
    { title: 'Mission', desc: 'Secure medical logs, strict credentials vetting for practitioners, and automated prescriptions.', icon: ShieldCheck, color: 'text-primary bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Platform Trust', desc: 'Connecting patients to verified clinical practitioners through secure MERN frameworks.', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12 pb-16 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-3">
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-800 dark:text-slate-100">About Medicare</h1>
        <p className="text-customGray dark:text-slate-400 max-w-xl mx-auto">
          We combine advanced WebTech and patient care pipelines to provide seamless healthcare.
        </p>
      </div>

      <GlassCard hoverEffect={false} className="p-8 space-y-6">
        <h2 className="font-poppins font-bold text-xl">Our Strategic Core</h2>
        <p className="text-customGray dark:text-slate-400 text-sm leading-relaxed">
          Medicare connects verified clinical practitioners to patients globally. Patients schedule dates/slots, checkout safely through Stripe card processors, and receive print-ready prescriptions on completed checkups. Our custom AI modules checker analyzes symptom keyphrases for recommendations.
        </p>
      </GlassCard>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {values.map((v, i) => {
          const Icon = v.icon;
          return (
            <GlassCard key={i} className="p-6 space-y-4 flex flex-col justify-between border-slate-100/50">
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${v.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-base">{v.title}</h3>
                <p className="text-xs text-customGray leading-relaxed">{v.desc}</p>
              </div>
            </GlassCard>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default About;
