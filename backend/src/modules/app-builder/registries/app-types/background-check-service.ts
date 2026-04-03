/**
 * Background Check Service App Type Definition
 *
 * Complete definition for background check service operations.
 * Essential for background screening companies, employment verification, and pre-employment services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BACKGROUND_CHECK_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'background-check-service',
  name: 'Background Check Service',
  category: 'professional-services',
  description: 'Background check platform with screening workflows, compliance management, report delivery, and client portal',
  icon: 'user-check',

  keywords: [
    'background check service',
    'background screening',
    'background check service software',
    'employment verification',
    'pre-employment',
    'background check service management',
    'screening workflows',
    'background check service practice',
    'background check service scheduling',
    'compliance management',
    'background check service crm',
    'report delivery',
    'background check service business',
    'client portal',
    'background check service pos',
    'criminal records',
    'background check service operations',
    'drug testing',
    'background check service platform',
    'tenant screening',
  ],

  synonyms: [
    'background check service platform',
    'background check service software',
    'background screening software',
    'employment verification software',
    'pre-employment software',
    'screening workflows software',
    'background check service practice software',
    'compliance management software',
    'report delivery software',
    'criminal records software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and reports' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Screenings and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/screenings' },
    { id: 'researcher', name: 'Researcher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'client', name: 'Client/Employer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a background check service platform',
    'Create a background screening app',
    'I need an employment verification system',
    'Build a pre-employment screening app',
    'Create a background check service portal',
  ],
};
