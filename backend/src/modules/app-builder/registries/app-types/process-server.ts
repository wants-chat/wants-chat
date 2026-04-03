/**
 * Process Server App Type Definition
 *
 * Complete definition for process serving operations.
 * Essential for process servers, legal document delivery, and skip tracing services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROCESS_SERVER_APP_TYPE: AppTypeDefinition = {
  id: 'process-server',
  name: 'Process Server',
  category: 'professional-services',
  description: 'Process server platform with job assignments, GPS tracking, proof of service, and attorney portal',
  icon: 'file-text',

  keywords: [
    'process server',
    'legal document delivery',
    'process server software',
    'skip tracing',
    'service of process',
    'process server management',
    'job assignments',
    'process server practice',
    'process server scheduling',
    'gps tracking',
    'process server crm',
    'proof of service',
    'process server business',
    'attorney portal',
    'process server pos',
    'subpoena service',
    'process server operations',
    'court filings',
    'process server platform',
    'document retrieval',
  ],

  synonyms: [
    'process server platform',
    'process server software',
    'legal document delivery software',
    'skip tracing software',
    'service of process software',
    'job assignments software',
    'process server practice software',
    'gps tracking software',
    'proof of service software',
    'subpoena service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jobs and status' },
    { id: 'admin', name: 'Server Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and tracking' },
  ],

  roles: [
    { id: 'admin', name: 'Agency Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Dispatch Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'server', name: 'Process Server', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'attorney', name: 'Attorney/Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a process server platform',
    'Create a legal document delivery app',
    'I need a process serving system',
    'Build a skip tracing service app',
    'Create a process server portal',
  ],
};
