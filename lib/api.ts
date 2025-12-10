/**
 * API utility for connecting frontend to backend
 */

// Use relative URL in production (same domain), absolute URL in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:3001');

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  user?: any;
  token?: string;
  refresh_token?: string;
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Fetch CSRF token on initialization
    if (typeof window !== 'undefined') {
      this.fetchCsrfToken();
    }
  }

  private async fetchCsrfToken() {
    try {
      const response = await fetch(`${this.baseUrl}/api/csrf-token`);
      const data = await response.json();
      this.csrfToken = data.csrfToken;
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from sessionStorage (more secure than localStorage)
    // sessionStorage is cleared when tab closes, reducing XSS attack window
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing operations
    if (this.csrfToken && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(options.method || '')) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'patient' | 'doctor' | 'admin';
  }): Promise<ApiResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Branches
  async getBranches() {
    return this.request('/api/branches');
  }

  async getBranch(id: string) {
    return this.request(`/api/branches/${id}`);
  }

  // Doctors
  async getDoctors(branchId?: string) {
    const url = branchId ? `/api/doctors?branchId=${branchId}` : '/api/doctors';
    return this.request(url);
  }

  async getDoctor(id: string) {
    return this.request(`/api/doctors/${id}`);
  }

  // Appointments
  async getAppointments(filters?: {
    patient_id?: string;
    doctor_id?: string;
    branch_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString();
    return this.request(`/api/appointments${query ? `?${query}` : ''}`);
  }

  async createAppointment(data: {
    doctor_id: string;
    branch_id: string;
    date: string;
    start_time: string;
    notes?: string;
  }) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: {
    status?: string;
    date?: string;
    start_time?: string;
    notes?: string;
  }) {
    return this.request(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Medical Records
  async getRecords(patientId: string) {
    return this.request(`/api/records/${patientId}`);
  }

  async createRecord(data: {
    patient_id: string;
    appointment_id?: string;
    notes: string;
    attachments?: string[];
  }) {
    return this.request('/api/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(id: string) {
    return this.request(`/api/records/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getUsers(filters?: { role?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return this.request(`/api/admin/users${query ? `?${query}` : ''}`);
  }

  async getAuditLogs(filters?: {
    entity?: string;
    action?: string;
    actor_id?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString();
    return this.request(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  }

  async getAnalytics(filters?: {
    branch_id?: string;
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString();
    return this.request(`/api/admin/analytics${query ? `?${query}` : ''}`);
  }
}

export const api = new ApiClient(API_URL);

