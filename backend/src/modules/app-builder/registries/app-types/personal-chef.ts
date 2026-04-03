/**
 * Personal Chef App Type Definition
 *
 * Complete definition for personal chef services.
 * Essential for private chefs, meal prep services, and in-home dining.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_CHEF_APP_TYPE: AppTypeDefinition = {
  id: 'personal-chef',
  name: 'Personal Chef',
  category: 'personal-services',
  description: 'Personal chef platform with menu planning, booking management, dietary preferences, and ingredient sourcing',
  icon: 'chef-hat',

  keywords: [
    'personal chef',
    'private chef',
    'personal chef software',
    'meal prep service',
    'in-home dining',
    'personal chef management',
    'menu planning',
    'personal chef practice',
    'personal chef scheduling',
    'dietary preferences',
    'personal chef crm',
    'catering service',
    'personal chef business',
    'ingredient sourcing',
    'personal chef pos',
    'dinner parties',
    'personal chef operations',
    'weekly meals',
    'personal chef platform',
    'culinary service',
  ],

  synonyms: [
    'personal chef platform',
    'personal chef software',
    'private chef software',
    'meal prep service software',
    'in-home dining software',
    'menu planning software',
    'personal chef practice software',
    'dietary preferences software',
    'catering service software',
    'culinary service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Menus and booking' },
    { id: 'admin', name: 'Chef Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and schedules' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chef', name: 'Head Chef', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Sous Chef', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/prep' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-service',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a personal chef platform',
    'Create a private chef booking portal',
    'I need a meal prep service management system',
    'Build an in-home dining booking platform',
    'Create a menu planning and client app',
  ],
};
