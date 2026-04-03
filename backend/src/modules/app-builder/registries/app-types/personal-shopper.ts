/**
 * Personal Shopper App Type Definition
 *
 * Complete definition for personal shopping services.
 * Essential for personal shoppers, stylists, and shopping concierge.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERSONAL_SHOPPER_APP_TYPE: AppTypeDefinition = {
  id: 'personal-shopper',
  name: 'Personal Shopper',
  category: 'personal-services',
  description: 'Personal shopping platform with style profiles, shopping requests, item sourcing, and delivery coordination',
  icon: 'shopping-bag',

  keywords: [
    'personal shopper',
    'personal stylist',
    'personal shopper software',
    'shopping concierge',
    'wardrobe styling',
    'personal shopper management',
    'style profiles',
    'personal shopper practice',
    'personal shopper booking',
    'item sourcing',
    'personal shopper crm',
    'fashion consulting',
    'personal shopper business',
    'gift shopping',
    'personal shopper pos',
    'luxury shopping',
    'personal shopper operations',
    'closet organization',
    'personal shopper platform',
    'shopping assistance',
  ],

  synonyms: [
    'personal shopper platform',
    'personal shopper software',
    'personal stylist software',
    'shopping concierge software',
    'wardrobe styling software',
    'style profiles software',
    'personal shopper practice software',
    'item sourcing software',
    'fashion consulting software',
    'shopping assistance software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Requests and style' },
    { id: 'admin', name: 'Shopper Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'stylist', name: 'Lead Stylist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'shopper', name: 'Personal Shopper', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
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
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'car-inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a personal shopper platform',
    'Create a personal stylist portal',
    'I need a shopping concierge management system',
    'Build a wardrobe styling platform',
    'Create a style profile and shopping app',
  ],
};
