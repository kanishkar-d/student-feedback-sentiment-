import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OverviewStats, TrendPoint, AspectScore, Feedback } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { SentimentDonut } from '../components/charts/SentimentDonut';
import { AspectRadar } from '../components/charts/AspectRadar';
import { TrendLine } from '../components/charts/TrendLine';
import { MessageSquare, ThumbsUp, Star, AlertCircle, Sparkles, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [aspects, setAspects] = useState<AspectScore[]>([]);
  const [strengths, setStrengths] = useState<{ top_strengths: string[]; top_improvements: string[] }>({
    top_strengths: [],
    top_improvements: []
  });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<string>('');

  const facultyId = user?.id;

  const loadFacultyData = async () => {
    if (!facultyId) return;
    setLoading(true);
    try {
      const [s, t, a, str, fb] = await Promise.all([
        api.getOverviewStats(facultyId),
        api.getTrendStats(facultyId),
        api.getAspectAnalytics(facultyId),
        api.getStrengthsAndImprovements(facultyId),
        api.getFeedback({ faculty_id: facultyId, limit: 20 })
      ]);
      setStats(s);
      setTrends(t);
      setAspects(a);
      setStrengths(str);
      setFeedbacks(fb);
    } catch (err: any) {
      toast.error('Failed to load faculty analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, [facultyId]);

  const filteredFeedbacks = sentimentFilter 
    ? feedbacks.filter(f => f.sentiment_result?.sentiment.toLowerCase() === sentimentFilter.toLowerCase())
    : feedbacks;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Course Sentiment Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Faculty Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Faculty Insights Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, Professor {user?.full_name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing student feedback across your assigned courses with RoBERTa aspect extraction.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Course Feedback Received"
            value={stats.total_feedback}
            icon={MessageSquare}
            color="brand"
            subtitle="Total student responses"
          />
          <StatCard
            title="Positive Sentiment Rate"
            value={stats.positive_percentage}
            suffix="%"
            decimals={1}
            icon={ThumbsUp}
            color="positive"
            subtitle={`${stats.positive_count} positive ratings`}
          />
          <StatCard
            title="Average Course Rating"
            value={stats.average_rating}
            suffix=" / 5.0"
            decimals={2}
            icon={Star}
            color="neutral"
            subtitle="Overall student evaluation"
          />
          <StatCard
            title="Critical Comments"
            value={stats.negative_count}
            icon={AlertCircle}
            color="negative"
            subtitle="Constructive feedback points"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SentimentDonut
            positive={stats?.positive_count || 0}
            neutral={stats?.neutral_count || 0}
            negative={stats?.negative_count || 0}
          />
        </div>
        <div className="lg:col-span-2">
          <TrendLine data={trends} />
        </div>
      </div>

      {/* AI Strengths & Aspect Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AspectRadar data={aspects} />

        <div className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> AI Automated Key Takeaways
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider text-[11px]">
                Top Commended Strengths
              </h4>
              <ul className="space-y-2">
                {strengths.top_strengths.length > 0 ? (
                  strengths.top_strengths.map((s, idx) => (
                    <li key={idx} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200/50">
                      ✓ {s}
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ Clear explanations and supportive classroom pedagogy.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider text-[11px]">
                Recommended Action Items
              </h4>
              <ul className="space-y-2">
                {strengths.top_improvements.length > 0 ? (
                  strengths.top_improvements.map((imp, idx) => (
                    <li key={idx} className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium border border-amber-200/50">
                      • {imp}
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                    • Provide earlier assignment rubrics to assist student deadline management.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Student Feedback List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Detailed Student Feedback</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Anonymous and registered comments with NLP sentiment tags</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.length === 0 ? (
            <p className="col-span-2 text-center py-8 text-slate-400 text-xs">No feedback entries found matching selection.</p>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {fb.course_code || `Course #${fb.course_id}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {fb.rating}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fb.sentiment_result?.sentiment === 'Positive'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : fb.sentiment_result?.sentiment === 'Negative'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {fb.sentiment_result?.sentiment}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{fb.raw_comment}"
                </p>

                {fb.aspect_results && fb.aspect_results.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fb.aspect_results.map((asp, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {asp.aspect_category} ({asp.aspect_sentiment})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
