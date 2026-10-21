import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ModelInsightItem } from '../types';
import { Cpu, Zap, Layers, CheckCircle2, ShieldCheck, BarChart3, Code2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const ModelInsightsPage: React.FC = () => {
  const [data, setData] = useState<{
    models: ModelInsightItem[];
    preprocessing_pipeline: string[];
    aspect_categories: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.getModelInsights();
        setData(res);
      } catch {
        toast.error('Failed to fetch model insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading AI Model Benchmarks & NLP Specs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5 text-brand-500" />
          <span>NLP Architecture & Benchmarks</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Model Engine Architecture & Benchmark Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Comparative evaluation between HuggingFace RoBERTa Transformer and VADER Lexicon engine.
        </p>
      </div>

      {/* Model Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.models.map((m, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                  m.name.includes('RoBERTa') ? 'bg-gradient-to-tr from-brand-600 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                }`}>
                  {m.name.includes('RoBERTa') ? <Cpu className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{m.type}</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                m.offline_ready ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              }`}>
                {m.offline_ready ? 'Offline Ready' : 'GPU / Local Cached'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {m.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-lg font-black text-brand-600 dark:text-brand-400">{(m.accuracy * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-slate-500 font-medium">Accuracy</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{(m.f1_score * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-slate-500 font-medium">F1-Score</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">{m.speed_ms} ms</p>
                <p className="text-[10px] text-slate-500 font-medium">Latency</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preprocessing & Aspect Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preprocessing Steps */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-500" /> Text Preprocessing & Cleaning Pipeline
          </h3>
          <ul className="space-y-2.5 text-xs">
            {data?.preprocessing_pipeline.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Aspect Categories */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" /> Supported Academic Aspect Categories
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data?.aspect_categories.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                {cat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
