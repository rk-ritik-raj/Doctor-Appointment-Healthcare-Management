import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';
import toast from 'react-hot-toast';

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    toast.success('Your message was successfully received! Medicare support will contact you.');
    reset();
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12 pb-16 max-w-5xl mx-auto"
    >
      <div className="text-center space-y-3">
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-800 dark:text-slate-100">Contact Support</h1>
        <p className="text-customGray dark:text-slate-400 max-w-xl mx-auto">
          Need clinical or billing support? Fill out the form below or find our regional office.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detail cards */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Emergency Support</h4>
              <p className="text-xs text-customGray mt-0.5">+1 (555) 234-5678</p>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Billing & Clinical Help</h4>
              <p className="text-xs text-customGray mt-0.5">support@medicare.com</p>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">HQ Office</h4>
              <p className="text-xs text-customGray mt-0.5 leading-relaxed">
                100 Health Sciences Plaza, Suite 400, San Francisco, CA
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false} className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-customGray">Your Name</label>
                  <input
                    type="text"
                    {...register('name', { required: true })}
                    placeholder="Jane"
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-customGray">Email Address</label>
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    placeholder="jane@example.com"
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-customGray">Subject</label>
                <input
                  type="text"
                  {...register('subject', { required: true })}
                  placeholder="Clinical Question"
                  className="input-field py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-customGray">Message Body</label>
                <textarea
                  {...register('message', { required: true })}
                  placeholder="Describe your question or support request details..."
                  rows={4}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <CustomButton type="submit" loading={isSubmitting} className="px-6 py-2.5">
                  Send Message <Send size={16} />
                </CustomButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Google Maps placeholder stub */}
      <GlassCard hoverEffect={false} className="h-64 p-0 overflow-hidden relative border-slate-100/50">
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
          <MapPin className="text-primary animate-bounce" size={32} />
          <span className="font-bold text-sm">Google Maps Satellite Display</span>
          <span className="text-xs text-customGray">Lat: 37.7749&deg; N, Long: -122.4194&deg; W</span>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Contact;
