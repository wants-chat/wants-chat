/**
 * Fence Company App Type Definition
 *
 * Complete definition for fence company operations.
 * Essential for fence contractors, gate installers, and perimeter specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FENCE_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'fence-company',
  name: 'Fence Company',
  category: 'construction',
  description: 'Fence company platform with estimate generation, installation scheduling, material management, and warranty tracking',
  icon: 'fence',

  keywords: [
    'fence company',
    'fence contractor',
    'fence company software',
    'gate installer',
    'perimeter fencing',
    'fence company management',
    'estimate generation',
    'fence company practice',
    'fence company scheduling',
    'installation scheduling',
    'fence company crm',
    'material management',
    'fence company business',
    'warranty tracking',
    'fence company pos',
    'wood fence',
    'fence company operations',
    'vinyl fence',
    'fence company platform',
    'chain link',
  ],

  synonyms: [
    'fence company platform',
    'fence company software',
    'fence contractor software',
    'gate installer software',
    'perimeter fencing software',
    'estimate generation software',
    'fence company practice software',
    'installation scheduling software',
    'material management software',
    'vinyl fence software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Estimates and styles' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and materials' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'estimator', name: 'Estimator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/estimates' },
    { id: 'installer', name: 'Install Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
    'project-bids',
    'daily-logs',
    'material-takeoffs',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fence company platform',
    'Create a fence contractor portal',
    'I need a fence company management system',
    'Build an estimate generation platform',
    'Create an installation and material app',
  ],
};
