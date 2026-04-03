/**
 * Court Reporting App Type Definition
 *
 * Complete definition for court reporting service operations.
 * Essential for court reporters, deposition services, and legal transcription.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COURT_REPORTING_APP_TYPE: AppTypeDefinition = {
  id: 'court-reporting',
  name: 'Court Reporting',
  category: 'professional-services',
  description: 'Court reporting platform with job scheduling, transcript management, billing integration, and client portal',
  icon: 'gavel',

  keywords: [
    'court reporting',
    'court reporter',
    'court reporting software',
    'deposition services',
    'legal transcription',
    'court reporting management',
    'job scheduling',
    'court reporting practice',
    'court reporting scheduling',
    'transcript management',
    'court reporting crm',
    'billing integration',
    'court reporting business',
    'client portal',
    'court reporting pos',
    'stenography',
    'court reporting operations',
    'real-time reporting',
    'court reporting platform',
    'video depositions',
  ],

  synonyms: [
    'court reporting platform',
    'court reporting software',
    'court reporter software',
    'deposition services software',
    'legal transcription software',
    'job scheduling software',
    'court reporting practice software',
    'transcript management software',
    'billing integration software',
    'stenography software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jobs and transcripts' },
    { id: 'admin', name: 'Reporter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and billing' },
  ],

  roles: [
    { id: 'admin', name: 'Firm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'reporter', name: 'Court Reporter', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'attorney', name: 'Attorney/Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'dashboard',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a court reporting platform',
    'Create a deposition service app',
    'I need a court reporter management system',
    'Build a legal transcription app',
    'Create a court reporting portal',
  ],
};
