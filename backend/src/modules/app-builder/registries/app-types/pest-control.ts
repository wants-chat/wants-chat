/**
 * Pest Control App Type Definition
 *
 * Complete definition for pest control and extermination applications.
 * Essential for pest control companies, exterminators, and wildlife removal services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PEST_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'pest-control',
  name: 'Pest Control',
  category: 'services',
  description: 'Pest control platform with service booking, treatment tracking, technician dispatch, and recurring plans',
  icon: 'bug',

  keywords: [
    'pest control',
    'exterminator',
    'pest removal',
    'bug control',
    'orkin',
    'terminix',
    'rentokil',
    'aptive',
    'termite',
    'rodent control',
    'mosquito control',
    'bed bugs',
    'roaches',
    'ants',
    'wildlife removal',
    'fumigation',
    'pest inspection',
    'pest prevention',
    'integrated pest management',
    'commercial pest control',
    'residential pest control',
    'pest treatment',
  ],

  synonyms: [
    'pest control platform',
    'exterminator software',
    'pest control software',
    'pest management app',
    'extermination software',
    'pest control app',
    'pest service platform',
    'pest control business software',
    'pest removal app',
    'pest control management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and view treatment history' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Technician and service management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Branch Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/route' },
    { id: 'sales', name: 'Sales Rep', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/leads' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-services' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'gallery',
    'contracts',
    'clients',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a pest control business platform',
    'Create an exterminator booking app',
    'I need a pest control route management software',
    'Build a pest control company management system',
    'Create a pest control app like Orkin',
  ],
};
