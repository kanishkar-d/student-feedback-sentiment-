import React from 'react';
import { motion } from 'framer-motion';

interface GaugeMeterProps {
  score?: number; // 0 to 1
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  confidence?: number;
  label?: string;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({ score = 0.5, sentiment = 'Positive', confidence = score, label }) => {
  // Angle from -90 to +90 degrees based on sentiment & confidence
  let angle = 0;
  let emoji = '😐';
  let colorClass = 'text-amber-500 stroke-amber-500';
  let bgGradient = 'from-amber-500/20 to-amber-500/5';

  if (sentiment === 'Positive') {
    angle = 30 + confidence * 60; // 30 to 90
    emoji = confidence > 0.8 ? '🤩' : '😊';
    colorClass = 'text-emerald-500 stroke-emerald-500';
    bgGradient = 'from-emerald-500/20 to-emerald-500/5';
  } else if (sentiment === 'Negative') {
    angle = -30 - confidence * 60; // -30 to -90
    emoji = confidence > 0.8 ? '😠' : '🙁';
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGradient = 'from-rose-500/20 to-rose-500/5';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b ${bgGradient} border border-slate-200/50 dark:border-slate-800/50 shadow-inner`}>
      <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
        {/* Semi Circle Gauge Background */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-800"
            strokeLinecap="round"
          />
          {/* Animated Gauge Pointer Path */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="126"
            initial={{ strokeDashoffset: 126 }}
            animate={{ strokeDashoffset: 126 - (126 * (angle + 90)) / 180 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={colorClass}
            strokeLinecap="round"
          />
        </svg>

        {/* Pointer Needle */}
        <motion.div
          className="absolute bottom-0 w-1 h-20 bg-slate-800 dark:bg-slate-100 rounded-full origin-bottom"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />

        {/* Center Knob */}
        <div className="absolute bottom-0 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 border-4 border-white dark:border-slate-900 shadow-md" />
      </div>

      {/* Emoji & Label */}
      <div className="mt-4 text-center space-y-1">
        <div className="text-4xl animate-bounce">{emoji}</div>
        <h3 className={`text-xl font-bold ${colorClass.replace('stroke-', '')}`}>
          {sentiment}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Confidence Score: <span className="font-bold text-slate-900 dark:text-slate-100">{(confidence * 100).toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
};
