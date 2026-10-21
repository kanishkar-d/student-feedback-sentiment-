import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, MessageSquarePlus, History, BarChart2, Users, 
  BookOpen, UploadCloud, FileText, Sparkles, Layers, Shield, Settings, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student', label: 'Overview & Submit', icon: MessageSquarePlus },
    { to: '/student/history', label: 'My Feedback History', icon: History },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Course Analytics', icon: LayoutDashboard },
    { to: '/faculty/comments', label: 'Student Comments', icon: History },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Global Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/courses', label: 'Courses & Depts', icon: BookOpen },
    { to: '/admin/upload', label: 'Bulk CSV Import', icon: UploadCloud },
  ];

  const commonLinks = [
    { to: '/live-analyzer', label: 'Live Text Analyzer', icon: Sparkles },
    { to: '/model-insights', label: 'Model Benchmarks', icon: Layers },
    { to: '/profile', label: 'Account Settings', icon: Settings },
  ];

  const roleLinks = role === 'ADMIN' ? adminLinks : role === 'FACULTY' ? facultyLinks : studentLinks;

  const renderContent = () => (
    <>
      <div className="space-y-6">
        {/* Role Badge */}
        <div className="p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                {role === 'ADMIN' ? 'Administrator Workspace' : role === 'FACULTY' ? 'Faculty Portal' : 'Student Portal'}
              </p>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Role Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Main Dashboard
          </p>
          {roleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeSideBar"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-brand-600 dark:bg-brand-400 rounded-r-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Tools & Insights */}
        <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            AI Tools & System
          </p>
          {commonLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-amber-500" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* System Status Card */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Model Engine</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          RoBERTa + VADER Fallback
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex-col justify-between hidden lg:flex rounded-3xl">
        {renderContent()}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-2xl z-10"
            >
              {renderContent()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
