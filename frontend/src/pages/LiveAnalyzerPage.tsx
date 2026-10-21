import React, { useState } from 'react';
import { api } from '../services/api';
import { LiveAnalyzeResponse } from '../types';
import { GaugeMeter } from '../components/ui/GaugeMeter';
import { Sparkles, Cpu, Layers, Tag, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const LiveAnalyzerPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    'The teaching quality and lecture clarity were fantastic, but the homework assignments were way too long and difficult.'
  );
  const [selectedModel, setSelectedModel] = useState<string>('auto'); // auto, roberta, vader
  const [result, setResult] = useState<LiveAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const samplePrompts = [
    'The professor explains complex neural networks with extreme clarity and gives helpful code examples.',
    'Exams were completely unfair, grading rubrics were non-existent, and emails were never replied to.',
    'The course content was average. Some labs were decent, but video recordings had horrible audio quality.',
    'Fantastic mentorship during office hours, highly approachable and punctual every single class.'
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text || text.trim().length < 2) {
      toast.error('Please enter a longer text to analyze.');
      return;
    }

    setLoading(true);
    try {
      const force_model = selectedModel === 'auto' ? undefined : selectedModel;
      const res = await api.analyzeText(text, force_model);
      setResult(res);
      toast.success('Text evaluated successfully!');
    } catch (err: any) {
      toast.error('Failed to analyze text. Ensure backend NLP server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive NLP Sandbox</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Live AI Feedback Sentiment & Aspect Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test HuggingFace RoBERTa & VADER models with custom academic comments.
          </p>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input & Model Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-600" /> Input Student Feedback Comment
            </h2>

            <div className="space-y-2">
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste any student feedback sentence..."
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Model Selector & Analyze Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Engine Mode:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="auto">Auto Selection (RoBERTa + VADER Fallback)</option>
                  <option value="vader">VADER Rule-Based Engine (Offline Fast)</option>
                  <option value="roberta">HuggingFace RoBERTa Transformer</option>
                </select>
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> {loading ? 'Evaluating Model...' : 'Run Live NLP Analysis'}
              </button>
            </div>

            {/* Preset Samples */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Try Preset Samples:</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(sample);
                      handleAnalyze(sample);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors text-left truncate max-w-xs"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Confidence Gauge */}
        <div className="space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analysis Output</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 text-[10px] font-bold">
                  {result.model_used}
                </span>
              </div>

              {/* Confidence Gauge */}
              <GaugeMeter score={result.confidence} sentiment={result.sentiment} confidence={result.confidence} />

              {/* Scores Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50">
                  <p className="font-bold text-emerald-600">{(result.pos_score * 100).toFixed(1)}%</p>
                  <p className="text-[10px]">Positive</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50">
                  <p className="font-bold text-amber-600">{(result.neu_score * 100).toFixed(1)}%</p>
                  <p className="text-[10px]">Neutral</p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/50">
                  <p className="font-bold text-rose-600">{(result.neg_score * 100).toFixed(1)}%</p>
                  <p className="text-[10px]">Negative</p>
                </div>
              </div>

              {/* Extracted Aspects */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-500" /> Extracted Aspects ({result.aspects.length})
                </h4>
                <div className="space-y-2">
                  {result.aspects.map((asp, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{asp.aspect_category}</p>
                        {asp.key_phrases && (
                          <p className="text-[10px] text-slate-500">Phrases: {asp.key_phrases}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asp.aspect_sentiment === 'Positive'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : asp.aspect_sentiment === 'Negative'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {asp.aspect_sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Keywords */}
              {result.keywords && result.keywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-brand-500" /> Key Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center space-y-3 border border-slate-200/80 dark:border-slate-800/80">
              <Sparkles className="w-8 h-8 text-brand-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Analysis Loaded Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click "Run Live NLP Analysis" or select a preset sample to view confidence scores & aspect details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
