/**
 * Roofing App Type Definition
 *
 * Complete definition for roofing contractor applications.
 * Essential for roofing companies, contractors, and storm restoration services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROOFING_APP_TYPE: AppTypeDefinition = {
  id: 'roofing',
  name: 'Roofing',
  category: 'services',
  description: 'Roofing platform with estimates, project management, crew scheduling, and insurance claim handling',
  icon: 'house-chimney',

  keywords: [
    'roofing',
    'roof repair',
    'roof replacement',
    'roofing contractor',
    'shingles',
    'metal roofing',
    'flat roof',
    'roof inspection',
    'storm damage',
    'hail damage',
    'roof leak',
    'gutter installation',
    'roof maintenance',
    'commercial roofing',
    'residential roofing',
    'roof estimate',
    'roof insurance claim',
    'roofing company',
    'roof coating',
    'skylight',
    'roof ventilation',
    'roofing software',
  ],

  synonyms: [
    'roofing platform',
    'roofing software',
    'roofing contractor app',
    'roof service software',
    'roofing management',
    'roofing business app',
    'roof repair software',
    'roofing company software',
    'roofing project management',
    'roofing estimating',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Request estimates and track projects' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Project and crew management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'estimator', name: 'Estimator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/estimates' },
    { id: 'crew-lead', name: 'Crew Leader', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-projects' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'gallery',
    'notifications',
    'calendar',
    'project-bids',
    'material-takeoffs',
    'daily-logs',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'crm',
    'reviews',
    'analytics',
    'subcontractor-mgmt',
    'site-safety',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a roofing contractor platform',
    'Create a roofing estimate and project management app',
    'I need a roofing company management software',
    'Build a storm damage restoration platform',
    'Create a roofing business app with crew scheduling',
  ],
};
