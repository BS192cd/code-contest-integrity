// lib/api-client.ts - Should point to your backend
// Base URL should include the /api segment to avoid duplicating in endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:3001/api"; // Changed default from 5000 to 3001

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Disable caching to always get fresh data
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide more detailed error information
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        const errorDetails = data.details || data.errors || '';
        const fullError = errorDetails ? `${errorMessage}: ${JSON.stringify(errorDetails)}` : errorMessage;
        
        // Create error with status code
        const error: any = new Error(fullError);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error: any) {
      // Don't log 401 errors - they're expected when not authenticated
      if (error.status !== 401) {
        console.error('API request failed:', error);
      }
      // If it's a JSON parse error, provide more context
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid response from server: ${error.message}`);
      }
      throw error;
    }
  }

  // Authentication endpoints
  async login(login: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'student' | 'teacher';
  }) {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/profile');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Contest endpoints
  async getContests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    difficulty?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<any[]>(`/contests${query ? `?${query}` : ''}`);
  }

  async getContest(id: string) {
    return this.request<any>(`/contests/${id}`);
  }

  async createContest(contestData: any) {
    return this.request<any>('/contests', {
      method: 'POST',
      body: JSON.stringify(contestData),
    });
  }

  async joinContest(contestId: string) {
    return this.request(`/contests/${contestId}/join`, {
      method: 'POST',
    });
  }

  async leaveContest(contestId: string) {
    return this.request(`/contests/${contestId}/leave`, {
      method: 'DELETE',
    });
  }

  // Problem endpoints
  async getProblems(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<any[]>(`/problems${query ? `?${query}` : ''}`);
  }

  async getProblem(id: string) {
    return this.request<any>(`/problems/${id}`);
  }

  async createProblem(problemData: any) {
    return this.request<any>('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateProblem(id: string, problemData: any) {
    return this.request<any>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    });
  }

  async deleteProblem(id: string) {
    return this.request<any>(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  async generateTestCases(id: string, problemData: any) {
    return this.request<any>(`/problems/${id}/generate-test-cases`, {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateContest(id: string, contestData: any) {
    return this.request<any>(`/contests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contestData),
    });
  }

  // Submission endpoints
  async submitSolution(submissionData: {
    code: string;
    language: string;
    problemId: string;
    contestId?: string;
  }) {
    return this.request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmissions(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    problemId?: string;
    contestId?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<any[]>(`/submissions${query ? `?${query}` : ''}`);
  }

  async getSubmission(id: string) {
    return this.request<any>(`/submissions/${id}`);
  }

  async runCode(codeData: {
    code: string;
    language: string;
    input?: string;
    problemId?: string;
  }) {
    return this.request<any>('/submissions/run', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  }

  // Leaderboard endpoints
  async getLeaderboard(contestId?: string) {
    const query = contestId ? `?contestId=${contestId}` : '';
    return this.request<any>(`/leaderboard${query}`);
  }

  // Analytics endpoints
  async getUserAnalytics(userId?: string) {
    const endpoint = userId ? `/analytics/users/${userId}` : '/analytics/users';
    return this.request<any>(endpoint);
  }

  async getContestAnalytics(contestId: string) {
    return this.request<any>(`/analytics/contests/${contestId}`);
  }

  // Classes endpoints
  async getClasses() {
    return this.request<any[]>('/classes');
  }

  async getClass(id: string) {
    return this.request<any>(`/classes/${id}`);
  }

  async createClass(classData: {
    name: string;
    description?: string;
    students?: string[];
    contests?: string[];
  }) {
    return this.request<any>('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClass(id: string, classData: {
    name?: string;
    description?: string;
    students?: string[];
    contests?: string[];
    isActive?: boolean;
  }) {
    return this.request<any>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  }

  async deleteClass(id: string) {
    return this.request<any>(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  async addStudentsToClass(classId: string, studentIds: string[]) {
    return this.request<any>(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    });
  }

  async removeStudentFromClass(classId: string, studentId: string) {
    return this.request<any>(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  async assignContestsToClass(classId: string, contestIds: string[]) {
    return this.request<any>(`/classes/${classId}/contests`, {
      method: 'POST',
      body: JSON.stringify({ contestIds }),
    });
  }

  async removeContestFromClass(classId: string, contestId: string) {
    return this.request<any>(`/classes/${classId}/contests/${contestId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for creating custom instances if needed
export { ApiClient };

// Export types
export type { ApiResponse };