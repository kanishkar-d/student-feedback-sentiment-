import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Cpu, BarChart3, 
  Layers, CheckCircle2, Star, Zap, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 text-brand-600 dark:text-brand-400 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI-Powered Academic Intelligence & Sentiment NLP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Transform Student Feedback into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-600">
              Actionable Academic Insights
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FeedbackIQ analyzes course comments using HuggingFace RoBERTa & VADER NLP. 
            Automatically extract teaching aspects, measure sentiment trends, and drive continuous course improvement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/live-analyzer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Try Live Text Analyzer
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              Portal Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Live Metrics Showcase Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          {[
            { label: 'Feedback Processed', val: '520+', sub: 'Real-time NLP' },
            { label: 'RoBERTa Accuracy', val: '92.4%', sub: 'High Precision' },
            { label: 'Aspect Categories', val: '8 Fine-Grained', sub: 'Teaching, Exams...' },
            { label: 'VADER Fallback', val: '100% Uptime', sub: 'Offline Protected' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl border text-center space-y-1">
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{stat.val}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{stat.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Students, Faculty & Administrators
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Comprehensive end-to-end features designed to make feedback submission safe, transparent, and instantly informative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transformer & VADER NLP</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dual-engine sentiment classification using HuggingFace RoBERTa model with seamless offline VADER rule-based fallback.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">8-Category Aspect Mining</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts precise sentiment scores across Teaching Quality, Assignments, Exams, Lab Facilities, Communication, Punctuality & Support.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interactive Analytics & Reports</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Animated radar charts, trend time-series, faculty leaderboards, word clouds, and instant PDF/CSV report exports.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border bg-gradient-to-br from-slate-900 to-slate-950 text-white">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">System Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">How FeedbackIQ Analyzes Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Submit Comment', desc: 'Student submits optional anonymous feedback for a course.' },
              { step: '02', title: 'Text Cleaning', desc: 'NLTK cleans text, strips URLs/emojis, and normalizes syntax.' },
              { step: '03', title: 'NLP Inference', desc: 'RoBERTa / VADER predicts sentiment & confidence score.' },
              { step: '04', title: 'Faculty Insights', desc: 'Dashboard updates in real-time with charts and PDF exports.' },
            ].map((st, idx) => (
              <div key={idx} className="space-y-3 relative p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-3xl font-black text-brand-400">{st.step}</span>
                <h4 className="text-base font-bold text-white">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
