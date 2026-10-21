import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Feedback } from '../types';
import { History, Star, Search, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeedbackHistoryPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getFeedback();
        setFeedbacks(data);
      } catch {
        toast.error('Failed to load feedback history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = feedbacks.filter(f => {
    const matchSearch = f.raw_comment.toLowerCase().includes(search.toLowerCase()) ||
                        (f.course_code && f.course_code.toLowerCase().includes(search.toLowerCase())) ||
                        (f.faculty_name && f.faculty_name.toLowerCase().includes(search.toLowerCase()));
    const matchSent = sentimentFilter ? f.sentiment_result?.sentiment.toLowerCase() === sentimentFilter.toLowerCase() : true;
    return matchSearch && matchSent;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Feedback History Archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
          <History className="w-3.5 h-3.5 text-brand-500" />
          <span>Historical Archive</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Feedback Submission History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review past course evaluation entries, sentiment scores, and extracted key phrases.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-800/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search comment or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {/* History Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs rounded-3xl">
            No feedback entries match your query.
          </div>
        ) : (
          filtered.map((fb) => (
            <div key={fb.id} className="glass-panel p-6 rounded-3xl space-y-3 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {fb.course_code ? `${fb.course_code} - ${fb.course_title}` : `Course #${fb.course_id}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({fb.faculty_name || `Faculty #${fb.faculty_id}`})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {fb.rating} / 5
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    fb.sentiment_result?.sentiment === 'Positive'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : fb.sentiment_result?.sentiment === 'Negative'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {fb.sentiment_result?.sentiment || 'Evaluated'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{fb.raw_comment}"
              </p>

              {fb.aspect_results && fb.aspect_results.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {fb.aspect_results.map((asp, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {asp.aspect_category}: <span className="font-bold">{asp.aspect_sentiment}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
