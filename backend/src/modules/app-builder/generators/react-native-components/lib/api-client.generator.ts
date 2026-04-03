/**
 * Generate API Client for React Native
 *
 * Creates a standalone API client module that handles HTTP requests with automatic
 * authentication token management using AsyncStorage. Provides convenience methods for
 * GET, POST, PUT, and DELETE requests.
 *
 * @returns {string} The API client module source code
 */
export function generateApiClient(): string {
  return `import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo SDK 54+ supports EXPO_PUBLIC_* environment variables natively
// These are automatically available in process.env without any babel plugin
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions {
  params?: Record<string, any>;
  requireAuth?: boolean;
}

class ApiClient {
  private async getHeaders(requireAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth header by default (matches frontend behavior)
    if (requireAuth) {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = \`Bearer \${token}\`;
      }
    }

    return headers;
  }

  async get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const url = new URL(\`\${API_URL}\${endpoint}\`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(options?.requireAuth ?? true),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async post<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'POST',
      headers: await this.getHeaders(options?.requireAuth ?? true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async put<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'PUT',
      headers: await this.getHeaders(options?.requireAuth ?? true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async patch<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'PATCH',
      headers: await this.getHeaders(options?.requireAuth ?? true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'DELETE',
      headers: await this.getHeaders(options?.requireAuth ?? true),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;`;
}
