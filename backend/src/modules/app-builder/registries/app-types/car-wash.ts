/**
 * Car Wash App Type Definition
 *
 * Complete definition for car wash and auto detailing applications.
 * Essential for car washes, auto detailing shops, and mobile wash services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAR_WASH_APP_TYPE: AppTypeDefinition = {
  id: 'car-wash',
  name: 'Car Wash',
  category: 'services',
  description: 'Car wash platform with service booking, membership plans, and mobile wash scheduling',
  icon: 'droplet',

  keywords: [
    'car wash',
    'auto detailing',
    'car detailing',
    'mobile car wash',
    'express wash',
    'full service wash',
    'auto spa',
    'car cleaning',
    'vehicle wash',
    'touchless car wash',
    'hand car wash',
    'wax service',
    'interior cleaning',
    'exterior wash',
    'wash subscription',
    'unlimited wash',
    'detailing service',
    'ceramic coating',
    'paint protection',
    'car care',
    'fleet washing',
    'car wash membership',
  ],

  synonyms: [
    'car wash platform',
    'car wash software',
    'auto detailing app',
    'car wash booking',
    'car wash management',
    'detailing software',
    'car wash app',
    'mobile wash platform',
    'car cleaning app',
    'wash service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book washes and manage memberships' },
    { id: 'admin', name: 'Wash Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and customer management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'attendant', name: 'Wash Attendant', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'detailer', name: 'Detailer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/book' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'subscriptions',
    'notifications',
    'search',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'clients',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a car wash booking platform',
    'Create an auto detailing service app',
    'I need a car wash membership system',
    'Build a mobile car wash booking app',
    'Create a car wash management software',
  ],
};
