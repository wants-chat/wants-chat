/**
 * Siding Contractor App Type Definition
 *
 * Complete definition for siding installation and repair operations.
 * Essential for siding contractors, exterior specialists, and home exterior companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIDING_CONTRACTOR_APP_TYPE: AppTypeDefinition = {
  id: 'siding-contractor',
  name: 'Siding Contractor',
  category: 'construction',
  description: 'Siding contractor platform with project estimation, material calculations, installation scheduling, and warranty tracking',
  icon: 'home',

  keywords: [
    'siding contractor',
    'exterior specialist',
    'siding contractor software',
    'vinyl siding',
    'fiber cement',
    'siding contractor management',
    'project estimation',
    'siding contractor practice',
    'siding contractor scheduling',
    'material calculations',
    'siding contractor crm',
    'installation scheduling',
    'siding contractor business',
    'warranty tracking',
    'siding contractor pos',
    'hardie board',
    'siding contractor operations',
    'trim work',
    'siding contractor platform',
    'exterior painting',
  ],

  synonyms: [
    'siding contractor platform',
    'siding contractor software',
    'exterior specialist software',
    'vinyl siding software',
    'fiber cement software',
    'project estimation software',
    'siding contractor practice software',
    'material calculations software',
    'installation scheduling software',
    'hardie board software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'team-management',
    'gallery',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'construction',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a siding contractor platform',
    'Create a siding installation app',
    'I need a home exterior system',
    'Build a siding business management app',
    'Create a siding company portal',
  ],
};
