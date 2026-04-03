/**
 * Soil Testing App Type Definition
 *
 * Complete definition for soil testing labs and agricultural services.
 * Essential for soil labs, agricultural testing, and geotechnical services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOIL_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'soil-testing',
  name: 'Soil Testing Lab',
  category: 'environmental',
  description: 'Soil testing platform with sample management, lab analysis, report generation, and client portal',
  icon: 'flask',

  keywords: [
    'soil testing',
    'soil analysis',
    'soil testing software',
    'agricultural testing',
    'soil lab',
    'soil testing management',
    'sample management',
    'soil testing practice',
    'soil testing scheduling',
    'lab analysis',
    'soil testing crm',
    'nutrient analysis',
    'soil testing business',
    'contamination testing',
    'soil testing pos',
    'geotechnical testing',
    'soil testing operations',
    'fertility testing',
    'soil testing services',
    'environmental sampling',
  ],

  synonyms: [
    'soil testing platform',
    'soil testing software',
    'soil analysis software',
    'agricultural testing software',
    'soil lab software',
    'sample management software',
    'soil testing practice software',
    'lab analysis software',
    'nutrient analysis software',
    'environmental sampling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Samples and results' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Analysis and reports' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'scientist', name: 'Lab Scientist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/analysis' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/samples' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'environmental',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a soil testing lab platform',
    'Create an agricultural testing portal',
    'I need a soil analysis management system',
    'Build a sample tracking platform',
    'Create a lab analysis and reporting app',
  ],
};
