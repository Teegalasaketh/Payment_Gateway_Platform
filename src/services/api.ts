import axios from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Read API base URL from import.meta.env
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Map the old mockClient exports to the new real Axios instance to keep compatibility
export const mockClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  },

  post: async <T>(url: string, payload: any, _delayMs?: number): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {};
    if (url === '/payments/create' || url.startsWith('/payments/')) {
      // Add idempotency key for payment creation
      headers['Idempotency-Key'] = `idem-key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    const response = await apiClient.post<T>(url, payload, { headers });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  },

  put: async <T>(url: string, payload: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<T>(url, payload);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  },
};
