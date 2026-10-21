import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  color?: 'brand' | 'positive' | 'neutral' | 'negative';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  icon: Icon,
  trend,
  subtitle,
  color = 'brand'
}) => {
  const [displayVal, setDisplayVal] = useState<number | null>(typeof value === 'number' ? 0 : null);

  useEffect(() => {
    if (typeof value !== 'number') return;
    let start = 0;
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayVal(value);
        clearInterval(timer);
      } else {
        setDisplayVal(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    brand: 'from-brand-500/10 to-indigo-500/5 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-900/40',
    positive: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40',
    neutral: 'from-amber-500/10 to-orange-500/5 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
    negative: 'from-rose-500/10 to-red-500/5 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40',
  };

  const iconBg = {
    brand: 'bg-brand-500 text-white shadow-brand-500/30',
    positive: 'bg-emerald-500 text-white shadow-emerald-500/30',
    neutral: 'bg-amber-500 text-white shadow-amber-500/30',
    negative: 'bg-rose-500 text-white shadow-rose-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`glass-panel rounded-3xl p-6 border bg-gradient-to-br ${colorStyles[color]} shadow-lg relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {prefix}{typeof value === 'number' ? (displayVal ?? value).toFixed(decimals) : value}{suffix}
            </span>
          </div>
          {(trend || subtitle) && (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {trend || subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl ${iconBg[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};
