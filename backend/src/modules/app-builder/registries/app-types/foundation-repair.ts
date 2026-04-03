/**
 * Foundation Repair App Type Definition
 *
 * Complete definition for foundation repair operations.
 * Essential for foundation repair contractors, structural specialists, and basement repair companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOUNDATION_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'foundation-repair',
  name: 'Foundation Repair',
  category: 'construction',
  description: 'Foundation repair platform with inspection scheduling, structural assessments, project estimation, and warranty management',
  icon: 'home',

  keywords: [
    'foundation repair',
    'structural repair',
    'foundation repair software',
    'basement repair',
    'pier installation',
    'foundation repair management',
    'inspection scheduling',
    'foundation repair practice',
    'foundation repair scheduling',
    'structural assessments',
    'foundation repair crm',
    'project estimation',
    'foundation repair business',
    'warranty management',
    'foundation repair pos',
    'crack repair',
    'foundation repair operations',
    'leveling',
    'foundation repair platform',
    'underpinning',
  ],

  synonyms: [
    'foundation repair platform',
    'foundation repair software',
    'structural repair software',
    'basement repair software',
    'pier installation software',
    'inspection scheduling software',
    'foundation repair practice software',
    'structural assessments software',
    'project estimation software',
    'crack repair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inspections and quotes' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'inspector', name: 'Structural Inspector', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inspections' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
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
    'gallery',
    'reporting',
    'analytics',
    'subcontractor-mgmt',
    'change-orders',
    'punch-lists',
    'site-safety',
    'equipment-tracking',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a foundation repair platform',
    'Create a structural repair company app',
    'I need a basement repair system',
    'Build a foundation contractor app',
    'Create a foundation repair portal',
  ],
};
