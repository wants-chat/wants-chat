/**
 * Subscription Box App Type Definition
 *
 * Complete definition for subscription box and recurring delivery applications.
 * Essential for subscription box businesses, curated product delivery, and recurring commerce.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUBSCRIPTION_BOX_APP_TYPE: AppTypeDefinition = {
  id: 'subscription-box',
  name: 'Subscription Box',
  category: 'ecommerce',
  description: 'Subscription box platform with recurring billing, box customization, subscriber management, and fulfillment',
  icon: 'package',

  keywords: [
    'subscription box',
    'subscription service',
    'monthly box',
    'curated box',
    'birchbox',
    'fabfitfun',
    'ipsy',
    'cratejoy',
    'recurring delivery',
    'subscription commerce',
    'box subscription',
    'mystery box',
    'snack box',
    'beauty box',
    'book box',
    'pet box',
    'meal kit',
    'subscription ecommerce',
    'curation service',
    'surprise box',
    'monthly subscription',
  ],

  synonyms: [
    'subscription box platform',
    'subscription box software',
    'subscription commerce platform',
    'recurring delivery software',
    'box subscription software',
    'subscription box website',
    'curated box platform',
    'subscription service app',
    'monthly box software',
    'subscription box management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Subscribe and manage deliveries' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Subscriptions and fulfillment' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/subscriptions' },
    { id: 'curator', name: 'Product Curator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/products' },
    { id: 'fulfillment', name: 'Fulfillment Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shipping' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'subscriptions',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'booking-system'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'ecommerce',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a subscription box platform',
    'Create a monthly curated box service',
    'I need a subscription commerce platform',
    'Build a recurring delivery box service',
    'Create a beauty subscription box app',
  ],
};
