/**
 * Pet Photography App Type Definition
 *
 * Complete definition for pet photography and animal portrait applications.
 * Essential for pet photographers, animal portrait studios, and pet photo services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_PHOTOGRAPHY_APP_TYPE: AppTypeDefinition = {
  id: 'pet-photography',
  name: 'Pet Photography',
  category: 'pets',
  description: 'Pet photography platform with session booking, gallery proofing, print ordering, and package management',
  icon: 'camera',

  keywords: [
    'pet photography',
    'pet photographer',
    'pet photos',
    'photography software',
    'animal portraits',
    'pet photo session',
    'pet photography booking',
    'dog photography',
    'cat photography',
    'pet studio',
    'pet photography crm',
    'pet photo gallery',
    'pet photo packages',
    'pet photography business',
    'pet portraits',
    'animal photography',
    'pet photo prints',
    'pet photography scheduling',
    'pet photo sessions',
    'pet photography management',
  ],

  synonyms: [
    'pet photography platform',
    'pet photography software',
    'pet photographer software',
    'animal portrait software',
    'pet photo booking software',
    'pet studio software',
    'pet gallery software',
    'pet photography management software',
    'pet portrait software',
    'animal photography software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'stock photography'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and galleries' },
    { id: 'admin', name: 'Photography Dashboard', enabled: true, basePath: '/admin', requiredRole: 'photographer', layout: 'admin', description: 'Sessions and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'photographer', name: 'Photographer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a pet photography booking platform',
    'Create a pet portrait studio app',
    'I need a pet photo gallery and ordering system',
    'Build a pet photographer management app',
    'Create a pet photo session booking platform',
  ],
};
