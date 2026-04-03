/**
 * Hardscaping App Type Definition
 *
 * Complete definition for hardscaping contractor operations.
 * Essential for patio builders, retaining wall contractors, and outdoor construction.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HARDSCAPING_APP_TYPE: AppTypeDefinition = {
  id: 'hardscaping',
  name: 'Hardscaping',
  category: 'construction',
  description: 'Hardscaping platform with project estimation, design visualization, material tracking, and job scheduling',
  icon: 'bricks',

  keywords: [
    'hardscaping',
    'patio builder',
    'hardscaping software',
    'retaining walls',
    'outdoor construction',
    'hardscaping management',
    'project estimation',
    'hardscaping practice',
    'hardscaping scheduling',
    'design visualization',
    'hardscaping crm',
    'material tracking',
    'hardscaping business',
    'job scheduling',
    'hardscaping pos',
    'pavers',
    'hardscaping operations',
    'outdoor living spaces',
    'hardscaping platform',
    'stone work',
  ],

  synonyms: [
    'hardscaping platform',
    'hardscaping software',
    'patio builder software',
    'retaining walls software',
    'outdoor construction software',
    'project estimation software',
    'hardscaping practice software',
    'design visualization software',
    'material tracking software',
    'pavers software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and estimates' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and materials' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Project Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'scheduling',
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
    'team-management',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'equipment-tracking',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'stone',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a hardscaping platform',
    'Create a patio builder portal',
    'I need a hardscaping management system',
    'Build a project estimation platform',
    'Create a design and material tracking app',
  ],
};
