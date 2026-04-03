/**
 * Appraisal Service App Type Definition
 *
 * Complete definition for appraisal service operations.
 * Essential for appraisers, valuation services, and property assessment companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPRAISAL_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'appraisal-service',
  name: 'Appraisal Service',
  category: 'professional-services',
  description: 'Appraisal service platform with order management, inspection scheduling, report generation, and lender portal',
  icon: 'calculator',

  keywords: [
    'appraisal service',
    'property appraisal',
    'appraisal service software',
    'real estate appraisal',
    'valuation service',
    'appraisal service management',
    'order management',
    'appraisal service practice',
    'appraisal service scheduling',
    'inspection scheduling',
    'appraisal service crm',
    'report generation',
    'appraisal service business',
    'lender portal',
    'appraisal service pos',
    'residential appraisal',
    'appraisal service operations',
    'commercial appraisal',
    'appraisal service platform',
    'amc management',
  ],

  synonyms: [
    'appraisal service platform',
    'appraisal service software',
    'property appraisal software',
    'real estate appraisal software',
    'valuation service software',
    'order management software',
    'appraisal service practice software',
    'inspection scheduling software',
    'report generation software',
    'residential appraisal software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and reports' },
    { id: 'admin', name: 'Appraiser Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'appraiser', name: 'Lead Appraiser', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'trainee', name: 'Trainee Appraiser', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'lender', name: 'Lender/Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'messaging',
    'documents',
    'property-valuation',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'mls-integration',
    'open-houses',
    'property-listings',
    'virtual-tours',
  ],

  incompatibleFeatures: ['restaurant-tables', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'professional-services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an appraisal service platform',
    'Create a property appraisal app',
    'I need a real estate appraisal system',
    'Build a valuation service app',
    'Create an appraisal service portal',
  ],
};
