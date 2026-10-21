import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Shield, Mail, Calendar, Key, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {user.full_name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-xs font-bold">
              {user.role}
            </span>
            <span className="text-xs text-slate-500">• {user.email}</span>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-600" /> Account Security & Profile Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-semibold">Full Name</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-semibold">Email Address</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-semibold">Access Level Role</span>
            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{user.role}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-semibold">Department</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {user.department_name || 'Global Academic Department'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Your account is active with full authenticated permissions for FeedbackIQ features.</span>
        </div>
      </div>
    </div>
  );
};
