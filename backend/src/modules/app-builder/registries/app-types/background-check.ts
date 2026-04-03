/**
 * Background Check App Type Definition
 *
 * Complete definition for background screening and verification applications.
 * Essential for background check companies, HR departments, and screening services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BACKGROUND_CHECK_APP_TYPE: AppTypeDefinition = {
  id: 'background-check',
  name: 'Background Check',
  category: 'security',
  description: 'Background screening platform with applicant management, verification workflows, compliance tracking, and reporting',
  icon: 'user-check',

  keywords: [
    'background check',
    'background screening',
    'employment verification',
    'background check software',
    'screening service',
    'criminal background',
    'reference check',
    'employment screening',
    'background verification',
    'pre-employment screening',
    'tenant screening',
    'drug testing',
    'identity verification',
    'credential verification',
    'background check business',
    'screening company',
    'compliance screening',
    'background investigation',
    'screening platform',
    'applicant screening',
  ],

  synonyms: [
    'background check platform',
    'background check software',
    'background screening software',
    'employment verification software',
    'screening service software',
    'pre-employment screening software',
    'tenant screening software',
    'background verification software',
    'identity verification software',
    'screening platform software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'photo background'],

  sections: [
    { id: 'frontend', name: 'Applicant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Status and consent' },
    { id: 'admin', name: 'Screening Dashboard', enabled: true, basePath: '/admin', requiredRole: 'screener', layout: 'admin', description: 'Cases and reports' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'screener', name: 'Screener', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/cases' },
    { id: 'client', name: 'Client Company', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'applicant', name: 'Applicant', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a background check platform',
    'Create a background screening app',
    'I need an employment verification system',
    'Build a tenant screening app',
    'Create a background check service platform',
  ],
};
