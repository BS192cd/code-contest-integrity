// lib/api-client.ts - Should point to your backend
// Base URL should include the /api segment to avoid duplicating in endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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