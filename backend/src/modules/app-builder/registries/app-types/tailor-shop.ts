/**
 * Tailor Shop App Type Definition
 *
 * Complete definition for tailor and alterations shop operations.
 * Essential for tailors, alterations shops, and custom clothing makers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAILOR_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tailor-shop',
  name: 'Tailor Shop',
  category: 'services',
  description: 'Tailor shop platform with measurement tracking, order management, fitting appointments, and custom orders',
  icon: 'scissors',

  keywords: [
    'tailor shop',
    'alterations',
    'tailor shop software',
    'custom clothing',
    'bespoke',
    'tailor shop management',
    'measurement tracking',
    'tailor shop practice',
    'tailor shop scheduling',
    'order management',
    'tailor shop crm',
    'fitting appointments',
    'tailor shop business',
    'custom orders',
    'tailor shop pos',
    'suit tailoring',
    'tailor shop operations',
    'hemming',
    'tailor shop platform',
    'bridal alterations',
  ],

  synonyms: [
    'tailor shop platform',
    'tailor shop software',
    'alterations software',
    'custom clothing software',
    'bespoke software',
    'measurement tracking software',
    'tailor shop practice software',
    'order management software',
    'fitting appointments software',
    'suit tailoring software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and fittings' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'tailor', name: 'Master Tailor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'assistant', name: 'Seamstress', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a tailor shop platform',
    'Create an alterations portal',
    'I need a custom tailoring system',
    'Build a measurement tracking platform',
    'Create a fitting appointment app',
  ],
};
