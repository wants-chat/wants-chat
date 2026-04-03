/**
 * Pet Cremation App Type Definition
 *
 * Complete definition for pet cremation service operations.
 * Essential for pet crematoriums, memorial services, and pet aftercare providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_CREMATION_APP_TYPE: AppTypeDefinition = {
  id: 'pet-cremation',
  name: 'Pet Cremation',
  category: 'services',
  description: 'Pet cremation platform with service scheduling, memorial options, urn selection, and pickup coordination',
  icon: 'flame',

  keywords: [
    'pet cremation',
    'pet memorial',
    'pet cremation software',
    'pet aftercare',
    'animal cremation',
    'pet cremation management',
    'service scheduling',
    'pet cremation practice',
    'pet cremation scheduling',
    'memorial options',
    'pet cremation crm',
    'urn selection',
    'pet cremation business',
    'pickup coordination',
    'pet cremation pos',
    'pet loss',
    'pet cremation operations',
    'cremation services',
    'pet cremation platform',
    'paw prints',
  ],

  synonyms: [
    'pet cremation platform',
    'pet cremation software',
    'pet memorial software',
    'pet aftercare software',
    'animal cremation software',
    'service scheduling software',
    'pet cremation practice software',
    'memorial options software',
    'urn selection software',
    'cremation services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and memorials' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Scheduling and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/services' },
    { id: 'staff', name: 'Service Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pickups' },
    { id: 'client', name: 'Pet Family', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'serene',

  examplePrompts: [
    'Build a pet cremation platform',
    'Create a pet memorial service app',
    'I need a pet aftercare system',
    'Build an animal cremation business app',
    'Create a pet cremation portal',
  ],
};
