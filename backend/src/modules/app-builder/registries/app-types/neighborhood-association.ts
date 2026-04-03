/**
 * Neighborhood Association App Type Definition
 *
 * Complete definition for neighborhood association management.
 * Essential for HOAs, neighborhood groups, and community associations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEIGHBORHOOD_ASSOCIATION_APP_TYPE: AppTypeDefinition = {
  id: 'neighborhood-association',
  name: 'Neighborhood Association',
  category: 'community',
  description: 'Neighborhood association platform with dues management, violation tracking, amenity booking, and community announcements',
  icon: 'home',

  keywords: [
    'neighborhood association',
    'hoa management',
    'neighborhood association software',
    'community association',
    'homeowners association',
    'neighborhood association management',
    'dues management',
    'neighborhood association practice',
    'neighborhood association scheduling',
    'violation tracking',
    'neighborhood association crm',
    'amenity booking',
    'neighborhood association business',
    'community announcements',
    'neighborhood association pos',
    'architectural review',
    'neighborhood association operations',
    'board meetings',
    'neighborhood association platform',
    'resident portal',
  ],

  synonyms: [
    'neighborhood association platform',
    'neighborhood association software',
    'hoa management software',
    'community association software',
    'homeowners association software',
    'dues management software',
    'neighborhood association practice software',
    'violation tracking software',
    'amenity booking software',
    'resident portal software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Resident Portal', enabled: true, basePath: '/', layout: 'public', description: 'Community and amenities' },
    { id: 'admin', name: 'Board Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Residents and management' },
  ],

  roles: [
    { id: 'admin', name: 'Board President', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'board', name: 'Board Member', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/requests' },
    { id: 'manager', name: 'Property Manager', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/violations' },
    { id: 'resident', name: 'Resident', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'calendar',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['car-inventory', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a neighborhood association platform',
    'Create an HOA management portal',
    'I need a community association system',
    'Build a resident portal platform',
    'Create a dues and violation tracking app',
  ],
};
