import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively transforms all object keys from snake_case to camelCase
 */
function transformKeysToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamel(item));
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeysToCamel(value);
    }
    return transformed;
  }

  return obj;
}

/**
 * Global interceptor that transforms all response keys from snake_case to camelCase
 * This ensures the frontend always receives camelCase responses regardless of
 * how the backend/database stores the data
 */
@Injectable()
export class CamelCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Transform all response data to camelCase
        return transformKeysToCamel(data);
      }),
    );
  }
}
