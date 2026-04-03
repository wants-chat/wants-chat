/**
 * Flooring Installer App Type Definition
 *
 * Complete definition for flooring installation operations.
 * Essential for flooring contractors, floor installers, and hardwood specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOORING_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'flooring-installer',
  name: 'Flooring Installer',
  category: 'construction',
  description: 'Flooring installer platform with project estimation, material tracking, installation scheduling, and warranty management',
  icon: 'layers',

  keywords: [
    'flooring installer',
    'floor contractor',
    'flooring installer software',
    'hardwood specialist',
    'tile installer',
    'flooring installer management',
    'project estimation',
    'flooring installer practice',
    'flooring installer scheduling',
    'material tracking',
    'flooring installer crm',
    'installation scheduling',
    'flooring installer business',
    'warranty management',
    'flooring installer pos',
    'vinyl flooring',
    'flooring installer operations',
    'laminate',
    'flooring installer platform',
    'carpet installation',
  ],

  synonyms: [
    'flooring installer platform',
    'flooring installer software',
    'floor contractor software',
    'hardwood specialist software',
    'tile installer software',
    'project estimation software',
    'flooring installer practice software',
    'material tracking software',
    'installation scheduling software',
    'vinyl flooring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and projects' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and materials' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a flooring installer platform',
    'Create a floor installation app',
    'I need a hardwood flooring system',
    'Build a tile installer business app',
    'Create a flooring company portal',
  ],
};
