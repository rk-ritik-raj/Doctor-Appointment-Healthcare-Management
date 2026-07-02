import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Bot, User, Send, Star, MapPin, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';

const AIChecker = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await API.post('/ai/symptom-check', { symptoms });
      setResult(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-16 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
          <Sparkles size={16} className="animate-pulse" /> Powered by Medicare Decision Trees
        </div>
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-800 dark:text-slate-100">
          AI Symptom Checker
        </h1>
        <p className="text-customGray dark:text-slate-400 max-w-xl mx-auto text-sm">
          Describe what symptoms you are feeling. Our assistant will isolate potential specialities and retrieve matching practitioners.
        </p>
      </div>

      <div className="space-y-6">
        {/* Chat input box */}
        <GlassCard hoverEffect={false} className="p-6">
          <form onSubmit={handleSymptomCheck} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray">
              Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I have a dry throat cough, mild fever, and sinus congestion..."
              rows={4}
              className="input-field text-sm"
              required
            />
            <div className="flex justify-end pt-2">
              <CustomButton type="submit" loading={loading} className="px-6 py-2.5">
                Analyze Symptoms <Send size={16} />
              </CustomButton>
            </div>
          </form>
        </GlassCard>

        {/* Results display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Recommendation details */}
            <div className="md:col-span-2 space-y-6">
              <GlassCard hoverEffect={false} className="p-6 space-y-4 border-l-4 border-primary">
                <h3 className="font-poppins font-bold text-lg flex items-center gap-2">
                  <Bot className="text-primary" size={24} /> AI Recommendation
                </h3>
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-customGray uppercase tracking-wider">Recommended Specialty</span>
                    <div className="text-base font-bold text-primary">{result.recommendedSpecialization}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-customGray uppercase tracking-wider">Clinical Likelihood</span>
                    <div className="text-base font-bold text-amber-500">{result.likelihood}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Diagnostic Explanation:</h4>
                  <p className="text-xs text-customGray leading-relaxed">{result.explanation}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Actionable Health Directives:</h4>
                  <div className="flex flex-col gap-2">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-customGray">
                        <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Matching Doctors */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="font-bold text-sm text-customGray uppercase tracking-wider flex items-center gap-1.5">
                Matching Practitioners
              </h3>
              
              {result.doctors.length === 0 ? (
                <GlassCard hoverEffect={false} className="p-6 text-center text-xs text-customGray">
                  No verified {result.recommendedSpecialization} doctors listed today.
                </GlassCard>
              ) : (
                <div className="flex flex-col gap-4">
                  {result.doctors.map((doc) => (
                    <GlassCard
                      key={doc._id}
                      onClick={() => navigate(`/doctors/${doc.user._id}`)}
                      className="p-4 flex gap-3 items-center border-slate-100/50"
                    >
                      <img
                        src={doc.user.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.user.name}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate">Dr. {doc.user.name}</h4>
                        <p className="text-[10px] text-customGray truncate flex items-center gap-0.5">
                          <MapPin size={10} /> {doc.hospital.name}
                        </p>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold mt-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" /> {doc.rating.toFixed(1)}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AIChecker;
