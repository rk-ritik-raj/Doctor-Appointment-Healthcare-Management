import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  pageTransition,
  containerVariants,
  itemVariants,
  cardHover,
  floatingCard
} from '../animations/variants';
import {
  Stethoscope,
  Heart,
  Smile,
  ShieldCheck,
  Award,
  ArrowRight,
  PhoneCall,
  UserCheck,
  ChevronRight,
  Brain,
  Baby,
  Eye,
  Scissors
} from 'lucide-react';
import CustomButton from '../components/CustomButton';
import GlassCard from '../components/GlassCard';

const Landing = () => {
  const navigate = useNavigate();

  const specialties = [
    { name: 'General Physician', icon: Stethoscope, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { name: 'Dentist', icon: Smile, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Cardiologist', icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    { name: 'Dermatologist', icon: Scissors, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30' },
    { name: 'Neurologist', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    { name: 'Orthopedic', icon: Award, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
    { name: 'Gynecologist', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { name: 'Pediatrician', icon: Baby, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30' },
  ];

  const stats = [
    { number: '500+', label: 'Certified Doctors' },
    { number: '50K+', label: 'Recovered Patients' },
    { number: '100+', label: 'Partner Hospitals' },
    { number: '98%', label: 'Satisfaction Rate' },
  ];

  const FAQs = [
    { q: 'How do I book an appointment?', a: 'Sign in as a patient, find your doctor using our search filters, pick an available slot, and proceed with Stripe payment confirmation.' },
    { q: 'Can I reschedule an appointment?', a: 'Yes! From your Patient Dashboard, you can select any pending or approved appointment and choose a new date and time slot.' },
    { q: 'How does the AI Symptom Checker work?', a: 'Our AI checker analyzes your descriptions to match symptoms to specialized doctors, giving recommendations.' },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-24 pb-16"
    >
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20"
          >
            <Stethoscope size={16} /> Medicare Portal v2.0
          </motion.div>
          
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">
            Your Trusted <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Healthcare Partner
            </span>
          </h1>
          
          <p className="text-customGray dark:text-slate-400 text-lg">
            Book appointments with certified doctors anytime, anywhere. Consult online, check symptoms using AI, and manage your health records on a single platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <CustomButton onClick={() => navigate('/doctors')} variant="primary" className="px-8 py-3">
              Book Appointment <ArrowRight size={18} />
            </CustomButton>
            <CustomButton onClick={() => navigate('/doctors')} variant="secondary" className="px-8 py-3">
              Find Doctors
            </CustomButton>
          </div>
        </div>

        {/* Hero Interactive UI Card Display */}
        <div className="relative flex items-center justify-center">
          {/* Glass background blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            <motion.div
              variants={floatingCard}
              animate="animate"
              className="glass-panel p-6 rounded-3xl shadow-glass border-white/40 flex flex-col justify-between h-48 mt-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Live Consultation</h3>
                <p className="text-xs text-customGray">Connect in real-time</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel p-6 rounded-3xl shadow-glass border-white/40 flex flex-col justify-between h-48"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">100% Certified</h3>
                <p className="text-xs text-customGray">Strict doctor vetting</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel p-6 rounded-3xl shadow-glass border-white/40 col-span-2 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">AI Assistant</h3>
                <p className="text-xs text-customGray">Evaluate symptoms instant recommendation</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 shadow-glass border-white/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-extrabold text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-customGray dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialities Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl">
            Explore Medical Specialities
          </h2>
          <p className="text-customGray dark:text-slate-400">
            Consult doctors across a wide range of medical fields for specialized care.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <GlassCard
                key={i}
                onClick={() => navigate(`/doctors?specialization=${spec.name}`)}
                className="flex flex-col items-center justify-center p-8 text-center gap-4 hover:border-primary/30 transition-all border-slate-100/50"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${spec.color}`}>
                  <Icon size={28} />
                </div>
                <span className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-100">
                  {spec.name}
                </span>
              </GlassCard>
            );
          })}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl">What Patients Say</h2>
          <p className="text-customGray dark:text-slate-400">Read verified reviews from platform members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard hoverEffect={false} className="p-8 flex flex-col justify-between gap-6">
            <p className="italic text-sm text-slate-600 dark:text-slate-400">
              "Booking was so quick, and I paid safely through Stripe. Dr. Peterson was extremely attentive and prescribed my blood test records which I downloaded as PDF."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div>
                <h4 className="font-bold text-sm">Sarah Jenkins</h4>
                <p className="text-xs text-primary">Patient</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="p-8 flex flex-col justify-between gap-6">
            <p className="italic text-sm text-slate-600 dark:text-slate-400">
              "The AI Symptom Checker matched me directly with a Cardiologist after I specified my minor chest aches. Outstanding diagnostics and platform design."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div>
                <h4 className="font-bold text-sm">Marcus Vance</h4>
                <p className="text-xs text-primary">Patient</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="p-8 flex flex-col justify-between gap-6">
            <p className="italic text-sm text-slate-600 dark:text-slate-400">
              "The real-time inbox chat let me upload my clinical scan to my doctor immediately. Getting advice online without clinic traffic saved my week."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200"></div>
              <div>
                <h4 className="font-bold text-sm">David Chen</h4>
                <p className="text-xs text-primary">Patient</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-3xl">Frequently Asked Questions</h2>
          <p className="text-customGray dark:text-slate-400">
            Got questions? We have answers. If you need more support, feel free to contact us.
          </p>
          <Link to="/contact">
            <CustomButton variant="glass" className="mt-4 px-6">
              Contact Support <ArrowRight size={16} />
            </CustomButton>
          </Link>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {FAQs.map((faq, i) => (
            <GlassCard key={i} hoverEffect={false} className="p-6">
              <h3 className="font-poppins font-bold text-base mb-2 text-slate-800 dark:text-slate-100 flex gap-2 items-center">
                <ChevronRight size={18} className="text-primary" /> {faq.q}
              </h3>
              <p className="text-sm text-customGray dark:text-slate-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-8 sm:p-12 text-white shadow-xl text-center overflow-hidden">
        {/* Decorative Circle overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl">Subscribe to our newsletter</h2>
          <p className="text-white/80">Get health articles, guidelines from professional doctors, and platform updates delivered to your inbox.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-5 py-3 rounded-full bg-white text-slate-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400 text-sm shadow-sm"
            />
            <CustomButton onClick={() => toast.success('Subscribed successfully!')} variant="glass" className="bg-white text-primary border-none shadow-md">
              Subscribe
            </CustomButton>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;
