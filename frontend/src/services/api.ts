import {
  User, Course, Department, FacultyCourse, Feedback, OverviewStats,
  TrendPoint, FacultyAnalytics, CourseAnalytics, AspectScore, WordCloudItem,
  LiveAnalyzeResponse, ModelInsightItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(formData: FormData): Promise<{ access_token: string; token_type: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async register(data: any): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Feedback
  async submitFeedback(data: { course_id: number; faculty_id: number; rating: number; raw_comment: string; is_anonymous: boolean }): Promise<Feedback> {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getFeedback(params?: { course_id?: number; faculty_id?: number; sentiment?: string; rating?: number; skip?: number; limit?: number }): Promise<Feedback[]> {
    const url = new URL(`${API_BASE_URL}/feedback`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/feedback/upload-csv`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },

  // Live Analyzer
  async analyzeText(text: string, force_model?: string): Promise<LiveAnalyzeResponse> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, force_model }),
    });
    return handleResponse(res);
  },

  // Analytics
  async getOverviewStats(faculty_id?: number): Promise<OverviewStats> {
    const url = new URL(`${API_BASE_URL}/analytics/overview`);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getTrendStats(faculty_id?: number): Promise<TrendPoint[]> {
    const url = new URL(`${API_BASE_URL}/analytics/trends`);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getFacultyAnalytics(): Promise<FacultyAnalytics[]> {
    const res = await fetch(`${API_BASE_URL}/analytics/faculty`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getCourseAnalytics(): Promise<CourseAnalytics[]> {
    const res = await fetch(`${API_BASE_URL}/analytics/courses`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAspectAnalytics(faculty_id?: number): Promise<AspectScore[]> {
    const url = new URL(`${API_BASE_URL}/analytics/aspects`);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getWordcloudData(faculty_id?: number): Promise<WordCloudItem[]> {
    const url = new URL(`${API_BASE_URL}/analytics/wordcloud`);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getStrengthsAndImprovements(faculty_id?: number): Promise<{ top_strengths: string[]; top_improvements: string[] }> {
    const url = new URL(`${API_BASE_URL}/analytics/strengths`);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // Admin CRUD
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE_URL}/admin/departments`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createDepartment(data: { name: string; code: string; description?: string }): Promise<Department> {
    const res = await fetch(`${API_BASE_URL}/admin/departments`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE_URL}/admin/courses`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createCourse(data: { code: string; title: string; department_id: number }): Promise<Course> {
    const res = await fetch(`${API_BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getFacultyCourses(): Promise<FacultyCourse[]> {
    const res = await fetch(`${API_BASE_URL}/admin/faculty-courses`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async assignFacultyCourse(data: { faculty_id: number; course_id: number; semester: string; year: number }): Promise<FacultyCourse> {
    const res = await fetch(`${API_BASE_URL}/admin/faculty-courses`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Model Insights
  async getModelInsights(): Promise<{ models: ModelInsightItem[]; preprocessing_pipeline: string[]; aspect_categories: string[] }> {
    const res = await fetch(`${API_BASE_URL}/model-insights`);
    return handleResponse(res);
  },

  // Reports
  getExportUrl(format: 'csv' | 'pdf', faculty_id?: number): string {
    const url = new URL(`${API_BASE_URL}/reports/export`);
    url.searchParams.append('format', format);
    if (faculty_id) url.searchParams.append('faculty_id', String(faculty_id));
    return url.toString();
  }
};
