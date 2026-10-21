import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">FeedbackIQ</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Academic Project Grade System. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Anonymous Feedback Protected
          </span>
          <span>RoBERTa Transformer + VADER Engine</span>
        </div>
      </div>
    </footer>
  );
};
