import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  OverviewStats, TrendPoint, FacultyAnalytics, CourseAnalytics, AspectScore, WordCloudItem, Feedback
} from '../types';
import { StatCard } from '../components/ui/StatCard';
import { SentimentDonut } from '../components/charts/SentimentDonut';
import { TrendLine } from '../components/charts/TrendLine';
import { AspectRadar } from '../components/charts/AspectRadar';
import { FacultyBar } from '../components/charts/FacultyBar';
import { WordCloudView } from '../components/charts/WordCloudView';
import { GaugeMeter } from '../components/ui/GaugeMeter';
import { 
  MessageSquare, ThumbsUp, AlertTriangle, Star, 
  FileSpreadsheet, FileText, Filter, RefreshCw, Layers,
  Search, UserCheck, Sparkles, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [facultyData, setFacultyData] = useState<FacultyAnalytics[]>([]);
  const [aspects, setAspects] = useState<AspectScore[]>([]);
  const [wordcloud, setWordcloud] = useState<WordCloudItem[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [strengths, setStrengths] = useState<{ top_strengths: string[]; top_improvements: string[] }>({
    top_strengths: [],
    top_improvements: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDashboardData = async (facultyId?: number) => {
    setLoading(true);
    try {
      const [s, t, f, a, w, fb, str] = await Promise.all([
        api.getOverviewStats(facultyId),
        api.getTrendStats(facultyId),
        api.getFacultyAnalytics(),
        api.getAspectAnalytics(facultyId),
        api.getWordcloudData(facultyId),
        api.getFeedback({ faculty_id: facultyId, limit: 15 }),
        api.getStrengthsAndImprovements(facultyId)
      ]);
      setStats(s);
      setTrends(t);
      setFacultyData(f);
      setAspects(a);
      setWordcloud(w);
      setRecentFeedbacks(fb);
      setStrengths(str);
    } catch (err: any) {
      toast.error('Failed to load admin analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(selectedFacultyId ? Number(selectedFacultyId) : undefined);
  }, [selectedFacultyId]);

  const handleExport = (format: 'csv' | 'pdf') => {
    const token = localStorage.getItem('token');
    const facultyParam = selectedFacultyId ? Number(selectedFacultyId) : undefined;
    const exportUrl = `${api.getExportUrl(format, facultyParam)}&token=${token}`;
    
    // Fetch directly with auth header for direct download
    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const prefix = selectedFacultyId ? `faculty_${selectedFacultyId}_report` : 'feedbackiq_institutional_report';
        a.download = `${prefix}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Exported ${format.toUpperCase()} report successfully!`);
      })
      .catch(() => toast.error('Report export failed. Check server status.'));
  };

  const filteredFeedbacks = recentFeedbacks.filter(f => {
    const matchesSentiment = !sentimentFilter || f.sentiment_result?.sentiment.toLowerCase() === sentimentFilter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      f.raw_comment.toLowerCase().includes(query) ||
      (f.course_code && f.course_code.toLowerCase().includes(query)) ||
      (f.faculty_name && f.faculty_name.toLowerCase().includes(query));
    return matchesSentiment && matchesSearch;
  });

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Academic Intelligence Analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate sentiment health for gauge
  const positivePercentage = stats?.positive_percentage || 0;
  const gaugeSentiment: 'Positive' | 'Neutral' | 'Negative' = 
    positivePercentage >= 55 ? 'Positive' : positivePercentage <= 35 ? 'Negative' : 'Neutral';
  const gaugeConfidence = 
    gaugeSentiment === 'Positive'
      ? positivePercentage / 100
      : gaugeSentiment === 'Negative'
      ? (stats?.negative_count || 0) / (stats?.total_feedback || 1)
      : (stats?.neutral_count || 0) / (stats?.total_feedback || 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Executive Academic Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Sentiment Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-aspect NLP analytics & institutional feedback trend metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Faculty Scope Selector */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value ? Number(e.target.value) : '')}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="">🏢 Institution Wide (All Faculty)</option>
              {facultyData.map((f) => (
                <option key={f.faculty_id} value={f.faculty_id}>
                  👨‍🏫 {f.faculty_name} ({f.department_name || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Export Actions */}
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Executive PDF
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Feedback Submissions"
            value={stats.total_feedback}
            icon={MessageSquare}
            color="brand"
            trend={selectedFacultyId ? 'Filtered by faculty' : '+12.5% from last semester'}
            subtitle={`${stats.active_courses} active courses`}
          />
          <StatCard
            title="Positive Sentiment Rate"
            value={stats.positive_percentage}
            suffix="%"
            decimals={1}
            icon={ThumbsUp}
            color="positive"
            trend={stats.positive_percentage >= 60 ? 'Strong Student Approval' : 'Moderate Approval'}
            subtitle={`${stats.positive_count} positive reviews`}
          />
          <StatCard
            title="Average Course Rating"
            value={stats.average_rating}
            suffix=" / 5.0"
            decimals={2}
            icon={Star}
            color="neutral"
            subtitle="Calculated across evaluations"
          />
          <StatCard
            title="Critical Concerns"
            value={stats.negative_count}
            icon={AlertTriangle}
            color="negative"
            trend={stats.negative_count > 5 ? 'Action recommended' : 'Low friction reported'}
            subtitle="Flagged by sentiment engine"
          />
        </div>
      )}

      {/* Main Charts Row 1: Donut + Pulse Gauge + TrendLine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SentimentDonut
            positive={stats?.positive_count || 0}
            neutral={stats?.neutral_count || 0}
            negative={stats?.negative_count || 0}
          />
          {stats && (
            <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  Institutional Sentiment Health Gauge
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 text-[10px] font-bold">
                  Confidence {(gaugeConfidence * 100).toFixed(0)}%
                </span>
              </div>
              <GaugeMeter
                score={gaugeConfidence}
                sentiment={gaugeSentiment}
                confidence={gaugeConfidence}
              />
            </div>
          )}
        </div>
        <div className="lg:col-span-7">
          <TrendLine data={trends} />
        </div>
      </div>

      {/* Main Charts Row 2: Aspect Radar & Faculty Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AspectRadar data={aspects} />
        <FacultyBar data={facultyData} />
      </div>

      {/* Word Cloud & Dynamic AI Strengths Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WordCloudView items={wordcloud} />
        </div>
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" /> Executive NLP Summary
          </h3>
          <div className="space-y-4 text-xs leading-relaxed">
            <div>
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider text-[11px]">
                Top Institutional Strengths
              </h4>
              <ul className="space-y-2">
                {strengths.top_strengths.length > 0 ? (
                  strengths.top_strengths.map((str, idx) => (
                    <li key={idx} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200/50">
                      ✓ {str}
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ High lecture clarity and supportive faculty interactions across departments.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider text-[11px]">
                Key Focus & Action Areas
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
                    • Align lab equipment and workload timelines to reduce student stress.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback Feed Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Student Submissions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest evaluated comments with RoBERTa/VADER aspect tagging</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search comments or faculty..."
                className="text-xs font-semibold pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 sm:w-56"
              />
            </div>

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1.5">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Course & Faculty</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Raw Comment</th>
                <th className="p-3">Sentiment</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 rounded-r-xl">Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">No feedback entries found matching filter.</td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{fb.course_code || `Course #${fb.course_id}`}</p>
                      <p className="text-[11px] text-slate-500">{fb.faculty_name || `Faculty #${fb.faculty_id}`}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {fb.rating}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate" title={fb.raw_comment}>
                      "{fb.raw_comment}"
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        fb.sentiment_result?.sentiment === 'Positive'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : fb.sentiment_result?.sentiment === 'Negative'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {fb.sentiment_result?.sentiment || 'Analyzed'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      {fb.sentiment_result?.confidence 
                        ? `${(fb.sentiment_result.confidence * 100).toFixed(1)}%` 
                        : 'N/A'}
                    </td>
                    <td className="p-3 text-[11px] font-medium text-slate-500">
                      {fb.sentiment_result?.model_used || 'VADER'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
