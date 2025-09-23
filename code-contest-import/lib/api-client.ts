// lib/api-client.ts - Should point to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(login: string, password: string) {
    return this.request('/api/auth/login', {  // ← FIXED: Added /api
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
    const response = await this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<{ user: any }>('/api/auth/profile');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
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
    return this.request<any[]>(`/api/contests${query ? `?${query}` : ''}`);
  }

  async getContest(id: string) {
    return this.request<any>(`/api/contests/${id}`);
  }

  async createContest(contestData: any) {
    return this.request<any>('/api/contests', {
      method: 'POST',
      body: JSON.stringify(contestData),
    });
  }

  async joinContest(contestId: string) {
    return this.request(`/api/contests/${contestId}/join`, {
      method: 'POST',
    });
  }

  async leaveContest(contestId: string) {
    return this.request(`/api/contests/${contestId}/leave`, {
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
    return this.request<any[]>(`/api/problems${query ? `?${query}` : ''}`);
  }

  async getProblem(id: string) {
    return this.request<any>(`/api/problems/${id}`);
  }

  // Submission endpoints
  async submitSolution(submissionData: {
    code: string;
    language: string;
    problemId: string;
    contestId?: string;
  }) {
    return this.request<any>('/api/submissions', {
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
    return this.request<any[]>(`/api/submissions${query ? `?${query}` : ''}`);
  }

  async getSubmission(id: string) {
    return this.request<any>(`/api/submissions/${id}`);
  }

  async runCode(codeData: {
    code: string;
    language: string;
    input?: string;
  }) {
    return this.request<any>('/api/submissions/run', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  }

  // Leaderboard endpoints
  async getLeaderboard(contestId?: string) {
    const query = contestId ? `?contestId=${contestId}` : '';
    return this.request<any>(`/api/leaderboard${query}`);
  }

  // Analytics endpoints
  async getUserAnalytics(userId?: string) {
    const endpoint = userId ? `/api/analytics/users/${userId}` : '/api/analytics/users';
    return this.request<any>(endpoint);
  }

  async getContestAnalytics(contestId: string) {
    return this.request<any>(`/api/analytics/contests/${contestId}`);
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/api/health');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for creating custom instances if needed
export { ApiClient };

// Export types
export type { ApiResponse };