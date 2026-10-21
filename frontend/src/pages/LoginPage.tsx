import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/student'); // Default redirect, AuthContext or user state handles role
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Demo credentials auto-filled for ${demoEmail}`);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Illustration & Demo Credentials */}
        <div className="p-8 bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">FeedbackIQ</span>
            </div>
            <h2 className="text-2xl font-black">Empowering Faculty & Students with NLP</h2>
            <p className="text-xs text-brand-100 leading-relaxed">
              Login to access course sentiment distribution, aspect metrics, and real-time student feedback insights.
            </p>
          </div>

          {/* Quick Demo Fill Buttons for Examiners */}
          <div className="space-y-3 pt-8 relative z-10 border-t border-white/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-200">
              ⚡ 1-Click Examiner Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@feedbackiq.edu', 'adminpassword123')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-all border border-white/20 text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('dr.smith@feedbackiq.edu', 'faculty123')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-all border border-white/20 text-center"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('student1@feedbackiq.edu', 'student123')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-all border border-white/20 text-center"
              >
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Back</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in with your university credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@feedbackiq.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In to Portal <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a student account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
