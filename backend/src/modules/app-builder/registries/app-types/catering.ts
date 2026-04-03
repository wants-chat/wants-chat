/**
 * Catering App Type Definition
 *
 * Complete definition for catering service applications.
 * Essential for catering companies, event caterers, and corporate catering.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'catering',
  name: 'Catering',
  category: 'food-beverage',
  description: 'Catering platform with quote requests, menu packages, event planning, and order management',
  icon: 'utensils',

  keywords: [
    'catering',
    'catering service',
    'event catering',
    'corporate catering',
    'wedding catering',
    'catering company',
    'catering menu',
    'catering quotes',
    'party catering',
    'buffet catering',
    'catering packages',
    'catering booking',
    'food catering',
    'catering events',
    'catering software',
    'drop-off catering',
    'full-service catering',
    'catering orders',
    'catering management',
    'banquet catering',
  ],

  synonyms: [
    'catering platform',
    'catering software',
    'catering management software',
    'event catering software',
    'catering booking software',
    'catering order software',
    'corporate catering software',
    'catering quote software',
    'wedding catering software',
    'catering service platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant dine-in'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Request quotes and order' },
    { id: 'admin', name: 'Catering Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Events and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Catering Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'coordinator', name: 'Event Coordinator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'chef', name: 'Head Chef', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/kitchen' },
    { id: 'staff', name: 'Catering Staff', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'kitchen-display',
    'calendar',
    'orders',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'pos-system',
    'contracts',
    'scheduling',
    'reviews',
    'clients',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-beverage',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a catering company platform',
    'Create a corporate catering app',
    'I need a catering quote system',
    'Build a wedding catering platform',
    'Create a catering order management app',
  ],
};
