import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-md">
                M
              </div>
              <span className="font-poppins font-bold text-xl text-white">
                Medicare
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              Medicare is a modern full-stack healthcare provider connecting verified clinical practitioners to patients globally.
            </p>
            <div className="flex gap-4 items-center text-sm text-slate-400 mt-2">
              <Heart className="text-danger fill-danger" size={16} /> Created for global medical health.
            </div>
          </div>

          {/* Nav Column */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-primary transition-colors">Find Doctors</Link>
              </li>
              <li>
                <Link to="/ai-checker" className="hover:text-primary transition-colors">AI Symptom Checker</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Medicare</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-bold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2 items-center">
                <Phone size={16} className="text-primary" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail size={16} className="text-primary" />
                <span>support@medicare.com</span>
              </li>
              <li className="flex gap-2 items-start">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>100 Health Sciences Plaza, Suite 400, San Francisco, CA</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-bold text-white mb-4">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-3">
              Subscribe to receive healthcare news and tips.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-primary hover:bg-primary-dark text-white shadow transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Medicare Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
