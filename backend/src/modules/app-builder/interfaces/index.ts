/**
 * Core Interfaces for No-Code App Builder
 *
 * Design Philosophy:
 * - Components define their data requirements (fields)
 * - Database schema is derived from components, not AI-generated
 * - Features map to pages, which map to components
 * - AI is used minimally for customization, not structure
 */

// Re-export all interfaces
export * from './app-type.interface';
export * from './feature.interface';
export * from './component.interface';
export * from './page-template.interface';
export * from './schema.interface';
export * from './generation.interface';
