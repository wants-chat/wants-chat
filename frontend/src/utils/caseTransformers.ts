/**
 * Generic case transformation utilities
 * Converts between snake_case (backend) and camelCase (frontend)
 */

/**
 * Convert a snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase (deep)
 */
export function transformKeysToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamel(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeysToCamel(value);
    }
    return transformed as T;
  }

  return obj;
}

/**
 * Transform object keys from camelCase to snake_case (deep)
 */
export function transformKeysToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToSnake(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformKeysToSnake(value);
    }
    return transformed as T;
  }

  return obj;
}

/**
 * Transform a paginated response, converting keys to camelCase
 * Handles: { data: [...], total, page, limit, total_pages }
 */
export function transformPaginatedResponse<T>(response: any): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  if (!response) {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  // Handle array response (non-paginated)
  if (Array.isArray(response)) {
    return {
      data: response.map((item) => transformKeysToCamel<T>(item)),
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  // Handle paginated response
  const data = Array.isArray(response.data)
    ? response.data.map((item: any) => transformKeysToCamel<T>(item))
    : [];

  return {
    data,
    total: response.total || data.length,
    page: response.page || 1,
    limit: response.limit || data.length,
    totalPages: response.total_pages || response.totalPages || 1,
  };
}

/**
 * Transform a single item response, converting keys to camelCase
 */
export function transformSingleResponse<T>(response: any): T | null {
  if (!response) {
    return null;
  }

  // If response has a data wrapper, unwrap it
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return transformKeysToCamel<T>(response.data);
  }

  return transformKeysToCamel<T>(response);
}

/**
 * Prepare data for backend by converting keys to snake_case
 * and removing undefined values
 */
export function prepareForBackend<T = any>(data: any): T {
  if (!data) {
    return data;
  }

  const transformed = transformKeysToSnake(data);

  // Remove undefined values
  if (typeof transformed === 'object' && !Array.isArray(transformed)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(transformed)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned as T;
  }

  return transformed;
}
