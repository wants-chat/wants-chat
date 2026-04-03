/**
 * Auto Detailing App Type Definition
 *
 * Complete definition for auto detailing and car care applications.
 * Essential for detailing shops, mobile detailers, and car care businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_DETAILING_APP_TYPE: AppTypeDefinition = {
  id: 'auto-detailing',
  name: 'Auto Detailing',
  category: 'automotive',
  description: 'Auto detailing platform with booking, service packages, customer management, and mobile dispatch',
  icon: 'sparkles',

  keywords: [
    'auto detailing',
    'car detailing',
    'detailing software',
    'mobile detailing',
    'car care',
    'detailing business',
    'detailing booking',
    'car wash detailing',
    'ceramic coating',
    'paint correction',
    'detailing packages',
    'detailing scheduling',
    'detailing shop',
    'auto cleaning',
    'interior detailing',
    'exterior detailing',
    'detailing crm',
    'detailing appointments',
    'car polish',
    'detailing management',
  ],

  synonyms: [
    'auto detailing platform',
    'auto detailing software',
    'car detailing software',
    'detailing booking software',
    'mobile detailing software',
    'detailing business software',
    'detailing scheduling software',
    'car care software',
    'detailing shop software',
    'detailing management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'product detail'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and packages' },
    { id: 'admin', name: 'Detailing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'detailer', layout: 'admin', description: 'Jobs and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'detailer', name: 'Detailer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-history',
    'gallery',
    'subscriptions',
    'reviews',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an auto detailing platform',
    'Create a mobile detailing app',
    'I need a detailing booking system',
    'Build a car care business app',
    'Create a detailing shop management platform',
  ],
};
