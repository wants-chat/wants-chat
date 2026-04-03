/**
 * Food Truck App Type Definition
 *
 * Complete definition for food truck and mobile food vendor applications.
 * Essential for food trucks, mobile kitchens, and street food vendors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_TRUCK_APP_TYPE: AppTypeDefinition = {
  id: 'food-truck',
  name: 'Food Truck',
  category: 'food-beverage',
  description: 'Food truck platform with location tracking, menu management, pre-ordering, and schedule posting',
  icon: 'truck',

  keywords: [
    'food truck',
    'mobile kitchen',
    'street food',
    'food trailer',
    'food truck app',
    'food truck tracker',
    'food truck schedule',
    'food truck menu',
    'mobile food',
    'food truck ordering',
    'food truck location',
    'food truck finder',
    'food truck events',
    'food truck catering',
    'taco truck',
    'mobile vendor',
    'food cart',
    'street vendor',
    'food truck fleet',
    'food truck booking',
  ],

  synonyms: [
    'food truck platform',
    'food truck software',
    'mobile kitchen software',
    'food truck tracking software',
    'food truck management software',
    'street food software',
    'food truck ordering system',
    'food truck scheduling software',
    'mobile food vendor software',
    'food truck finder app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'moving truck'],

  sections: [
    { id: 'frontend', name: 'Customer App', enabled: true, basePath: '/', layout: 'public', description: 'Find trucks and order' },
    { id: 'admin', name: 'Truck Dashboard', enabled: true, basePath: '/admin', requiredRole: 'owner', layout: 'admin', description: 'Schedule and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Fleet Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'owner', name: 'Truck Owner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/truck' },
    { id: 'operator', name: 'Truck Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
    'announcements',
    'reviews',
    'calendar',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a food truck tracking app',
    'Create a mobile kitchen platform',
    'I need a food truck ordering system',
    'Build a food truck fleet manager',
    'Create a street food finder app',
  ],
};
