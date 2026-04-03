/**
 * Fireplace Installer App Type Definition
 *
 * Complete definition for fireplace installation and service operations.
 * Essential for fireplace installers, hearth specialists, and gas fireplace companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIREPLACE_INSTALLER_APP_TYPE: AppTypeDefinition = {
  id: 'fireplace-installer',
  name: 'Fireplace Installer',
  category: 'construction',
  description: 'Fireplace installer platform with project consultation, installation scheduling, permit tracking, and service management',
  icon: 'flame',

  keywords: [
    'fireplace installer',
    'hearth specialist',
    'fireplace installer software',
    'gas fireplace',
    'wood stove',
    'fireplace installer management',
    'project consultation',
    'fireplace installer practice',
    'fireplace installer scheduling',
    'installation scheduling',
    'fireplace installer crm',
    'permit tracking',
    'fireplace installer business',
    'service management',
    'fireplace installer pos',
    'electric fireplace',
    'fireplace installer operations',
    'insert installation',
    'fireplace installer platform',
    'outdoor fireplace',
  ],

  synonyms: [
    'fireplace installer platform',
    'fireplace installer software',
    'hearth specialist software',
    'gas fireplace software',
    'wood stove software',
    'project consultation software',
    'fireplace installer practice software',
    'installation scheduling software',
    'permit tracking software',
    'electric fireplace software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and quotes' },
    { id: 'admin', name: 'Installer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and service' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'consultant', name: 'Design Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/consultations' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a fireplace installer platform',
    'Create a hearth specialist app',
    'I need a gas fireplace installation system',
    'Build a fireplace company management app',
    'Create a fireplace installer portal',
  ],
};
