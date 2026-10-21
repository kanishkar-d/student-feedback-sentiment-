export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  department_id?: number;
  department_name?: string;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  department_id: number;
  department_name?: string;
  created_at: string;
}

export interface FacultyCourse {
  id: number;
  faculty_id: number;
  faculty_name: string;
  course_id: number;
  course_code: string;
  course_title: string;
  semester: string;
  year: number;
}

export interface AspectResult {
  aspect_category: string;
  aspect_sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  key_phrases?: string;
}

export interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  pos_score: number;
  neu_score: number;
  neg_score: number;
  model_used: string;
  cleaned_text?: string;
  keywords?: string[];
}

export interface Feedback {
  id: number;
  course_id: number;
  course_code?: string;
  course_title?: string;
  faculty_id: number;
  faculty_name?: string;
  student_id?: number;
  student_name?: string;
  rating: number;
  raw_comment: string;
  is_anonymous: boolean;
  created_at: string;
  sentiment_result?: SentimentResult;
  aspect_results?: AspectResult[];
}

export interface OverviewStats {
  total_feedback: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  average_rating: number;
  active_courses: number;
  active_faculty: number;
}

export interface TrendPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  avg_rating: number;
}

export interface FacultyAnalytics {
  faculty_id: number;
  faculty_name: string;
  department_name?: string;
  total_feedback: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  avg_rating: number;
  ai_summary: string;
}

export interface CourseAnalytics {
  course_id: number;
  course_code: string;
  course_title: string;
  total_feedback: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  avg_rating: number;
}

export interface AspectScore {
  aspect_category: string;
  total_mentions: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  pos_percentage: number;
  avg_score: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
  sentiment: string;
}

export interface LiveAnalyzeResponse {
  raw_text: string;
  cleaned_text: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  pos_score: number;
  neu_score: number;
  neg_score: number;
  model_used: string;
  aspects: AspectResult[];
  keywords: string[];
}

export interface UploadResponse {
  filename: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_details?: string;
}

export interface ModelInsightItem {
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  avg_latency_ms: number;
  speed_ms?: number;
  description?: string;
  offline_ready?: boolean;
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
  };
}
