/**
 * Car Audio App Type Definition
 *
 * Complete definition for car audio and electronics installation shops.
 * Essential for car stereo shops, mobile electronics, and custom audio.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_AUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'car-audio',
  name: 'Car Audio',
  category: 'automotive',
  description: 'Car audio platform with installation scheduling, product catalog, custom design quotes, and bay management',
  icon: 'speaker',

  keywords: [
    'car audio',
    'car stereo',
    'car audio software',
    'mobile electronics',
    'car audio installation',
    'car audio management',
    'custom audio',
    'car audio shop',
    'car audio scheduling',
    'subwoofers',
    'car audio crm',
    'amplifiers',
    'car audio business',
    'remote start',
    'car audio pos',
    'dash cameras',
    'car audio operations',
    'sound system',
    'car audio services',
    'car electronics',
  ],

  synonyms: [
    'car audio platform',
    'car audio software',
    'car stereo software',
    'mobile electronics software',
    'car audio installation software',
    'custom audio software',
    'car audio shop software',
    'sound system software',
    'car electronics software',
    'car entertainment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home audio'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and installation' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'installer', layout: 'admin', description: 'Installations and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a car audio shop platform',
    'Create a mobile electronics installation app',
    'I need a car stereo scheduling system',
    'Build a custom audio design platform',
    'Create a car electronics shop app',
  ],
};
