export function generateApiClient(): string {
  return `// API client using fetch with automatic auth token handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  silentAuthFailure?: boolean;
}

async function fetchWithAuth(path: string, options: FetchOptions = {}) {
  const url = \`\${API_BASE_URL}\${path.startsWith('/') ? path : '/' + path}\`;
  const requireAuth = options.requireAuth ?? true;
  const silentAuthFailure = options.silentAuthFailure ?? false;

  // Get token from localStorage
  const token = localStorage.getItem('auth_token');

  // Check if body is FormData
  const isFormData = options.body instanceof FormData;

  // Create headers
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }
  // Don't auto-redirect, let PrivateRoute handle auth redirects

  // Execute the fetch
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized errors - just log, don't auto-redirect
    if (response.status === 401 && requireAuth && !silentAuthFailure) {
      console.error('Authentication failed - 401 response');
      // Don't auto-redirect, let the app handle auth state
    }

    return response;
  } catch (error) {
    console.error(\`API request to \${path} failed:\`, error);
    throw error;
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await response.text();
      }
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

// API client with convenience methods
export const api = {
  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    const response = await fetchWithAuth(path, {
      ...options,
      method: 'GET',
    });
    return handleApiResponse<T>(response);
  },

  async post<T>(path: string, data?: any, options?: FetchOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    const response = await fetchWithAuth(path, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
    return handleApiResponse<T>(response);
  },

  async put<T>(path: string, data?: any, options?: FetchOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    const response = await fetchWithAuth(path, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
    return handleApiResponse<T>(response);
  },

  async patch<T>(path: string, data?: any, options?: FetchOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    const response = await fetchWithAuth(path, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
    return handleApiResponse<T>(response);
  },

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    const response = await fetchWithAuth(path, {
      ...options,
      method: 'DELETE',
    });
    return handleApiResponse<T>(response);
  },
};

// Legacy axios-like export for compatibility
export const apiClient = api;`;
}
