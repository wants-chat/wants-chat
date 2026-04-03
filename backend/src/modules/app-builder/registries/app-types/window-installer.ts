/**
 * Window Installer App Type Definition
 *
 * Complete definition for window installation and replacement operations.
 * Essential for window companies, door installers, and replacement specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'window-installer',
  name: 'Window Installer',
  category: 'construction',
  description: 'Window installer platform with measurement tracking, product configuration, installation scheduling, and warranty management',
  icon: 'square',

  keywords: [
    'window installer',
    'window company',
    'window installer software',
    'door installer',
    'replacement windows',
    'window installer management',
    'measurement tracking',
    'window installer practice',
    'window installer scheduling',
    'product configuration',
    'window installer crm',
    'installation scheduling',
    'window installer business',
    'warranty management',
    'window installer pos',
    'energy efficient',
    'window installer operations',
    'patio doors',
    'window installer platform',
    'siding',
  ],

  synonyms: [
    'window installer platform',
    'window installer software',
    'window company software',
    'door installer software',
    'replacement windows software',
    'measurement tracking software',
    'window installer practice software',
    'product configuration software',
    'installation scheduling software',
    'energy efficient software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and orders' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Rep', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/quotes' },
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
    'gallery',
    'team-management',
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a window installer platform',
    'Create a window replacement app',
    'I need a door installation system',
    'Build a window company management app',
    'Create a window installer portal',
  ],
};
