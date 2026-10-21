import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, FacultyCourse, Feedback, LiveAnalyzeResponse } from '../types';
import { Star, Send, ShieldCheck, Sparkles, MessageSquare, History, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<FacultyCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | ''>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [rawComment, setRawComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [liveAnalysis, setLiveAnalysis] = useState<LiveAnalyzeResponse | null>(null);

  const [history, setHistory] = useState<Feedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cList, fcList, hList] = await Promise.all([
          api.getCourses(),
          api.getFacultyCourses(),
          api.getFeedback()
        ]);
        setCourses(cList);
        setFacultyCourses(fcList);
        setHistory(hList);
        if (cList.length > 0) setSelectedCourseId(cList[0].id);
      } catch (err: any) {
        toast.error('Failed to load courses.');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchData();
  }, []);

  // Update available faculty options based on course selection
  const filteredFacultyMappings = selectedCourseId
    ? facultyCourses.filter(fc => fc.course_id === Number(selectedCourseId))
    : facultyCourses;

  useEffect(() => {
    if (filteredFacultyMappings.length > 0) {
      setSelectedFacultyId(filteredFacultyMappings[0].faculty_id);
    } else {
      setSelectedFacultyId('');
    }
  }, [selectedCourseId, facultyCourses]);

  // Debounced live sentiment analysis
  useEffect(() => {
    if (rawComment.trim().length < 6) {
      setLiveAnalysis(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.analyzeText(rawComment);
        setLiveAnalysis(res);
      } catch {
        // Silent catch for live analysis
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [rawComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedFacultyId) {
      toast.error('Please select both a course and a faculty member.');
      return;
    }
    if (rawComment.trim().length < 5) {
      toast.error('Please enter at least 5 characters of feedback.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFeedback({
        course_id: Number(selectedCourseId),
        faculty_id: Number(selectedFacultyId),
        rating,
        raw_comment: rawComment,
        is_anonymous: isAnonymous
      });

      toast.success('Feedback submitted successfully!');
      setRawComment('');
      setLiveAnalysis(null);
      // Refresh history
      const updatedHistory = await api.getFeedback();
      setHistory(updatedHistory);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Student Feedback Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Submit Course Evaluation & Feedback
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your feedback is processed instantly via RoBERTa NLP to deliver constructive insights to course instructors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Submission Form */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800/80">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" /> Express Your Course Experience
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Course Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Faculty Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Instructor / Faculty
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {filteredFacultyMappings.length === 0 ? (
                    <option value="">No mapped faculty found</option>
                  ) : (
                    filteredFacultyMappings.map(fc => (
                      <option key={fc.id} value={fc.faculty_id}>
                        {fc.faculty_name} ({fc.semester} {fc.year})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Overall Course Rating
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Raw Comment Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Feedback Comment
                </label>
                <span className="text-[10px] text-slate-400">Min 5 characters</span>
              </div>
              <textarea
                rows={4}
                value={rawComment}
                onChange={(e) => setRawComment(e.target.value)}
                placeholder="Share your thoughts on lecture clarity, course material, assignments, exams, or instructor support..."
                className="w-full text-xs px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Submit Anonymously</p>
                  <p className="text-[11px] text-slate-500">Your student name will be hidden from faculty reports.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Analyzing & Submitting...' : 'Submit Student Feedback'}
            </button>
          </form>
        </div>

        {/* Live Preview & Sentiment Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Real-time Sentiment Preview
            </h3>

            {liveAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Detected Sentiment</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      liveAnalysis.sentiment === 'Positive'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : liveAnalysis.sentiment === 'Negative'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {liveAnalysis.sentiment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Model Used</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{liveAnalysis.model_used}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Confidence</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(liveAnalysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {liveAnalysis.aspects.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Extracted Aspects:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {liveAnalysis.aspects.map((asp, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                          {asp.aspect_category} ({asp.aspect_sentiment})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Start typing your feedback to see real-time NLP sentiment & aspect detection...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Feedback History */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-brand-600" /> My Feedback History
        </h3>

        {loadingHistory ? (
          <p className="text-xs text-slate-400 py-4">Loading feedback history...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">You have not submitted any feedback yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((fb) => (
              <div key={fb.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{fb.course_code || `Course #${fb.course_id}`}</span>
                    <span className="text-xs text-slate-500">• {fb.faculty_name || `Faculty #${fb.faculty_id}`}</span>
                    {fb.is_anonymous && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">Anonymous</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{fb.raw_comment}"</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {fb.rating}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    fb.sentiment_result?.sentiment === 'Positive'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : fb.sentiment_result?.sentiment === 'Negative'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {fb.sentiment_result?.sentiment || 'Submitted'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
