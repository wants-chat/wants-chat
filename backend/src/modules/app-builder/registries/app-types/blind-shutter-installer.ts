/**
 * Blind & Shutter Installer App Type Definition
 *
 * Complete definition for window treatment installation operations.
 * Essential for blind installers, shutter companies, and window treatment specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BLIND_SHUTTER_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'blind-shutter-installer',
  name: 'Blind & Shutter Installer',
  category: 'services',
  description: 'Blind and shutter installer platform with measurement scheduling, product configuration, installation tracking, and warranty management',
  icon: 'blinds',

  keywords: [
    'blind installer',
    'shutter company',
    'blind shutter installer software',
    'window treatment',
    'plantation shutters',
    'blind installer management',
    'measurement scheduling',
    'blind installer practice',
    'blind installer scheduling',
    'product configuration',
    'blind installer crm',
    'installation tracking',
    'blind installer business',
    'warranty management',
    'blind installer pos',
    'motorized blinds',
    'blind installer operations',
    'roller shades',
    'blind installer platform',
    'drapery',
  ],

  synonyms: [
    'blind shutter installer platform',
    'blind shutter installer software',
    'shutter company software',
    'window treatment software',
    'plantation shutters software',
    'measurement scheduling software',
    'blind installer practice software',
    'product configuration software',
    'installation tracking software',
    'motorized blinds software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and quotes' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/quotes' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a blind installer platform',
    'Create a shutter installation app',
    'I need a window treatment system',
    'Build a blind company management app',
    'Create a shutter business portal',
  ],
};
