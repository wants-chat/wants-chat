/**
 * Coffee Subscription App Type Definition
 *
 * Complete definition for coffee subscription services.
 * Essential for coffee subscriptions, roaster clubs, and bean delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COFFEE_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'coffee-subscription',
  name: 'Coffee Subscription',
  category: 'subscription',
  description: 'Coffee subscription platform with roast preferences, grind options, brewing guides, and origin stories',
  icon: 'coffee',

  keywords: [
    'coffee subscription',
    'roaster club',
    'coffee subscription software',
    'bean delivery',
    'specialty coffee',
    'coffee subscription management',
    'roast preferences',
    'coffee subscription practice',
    'coffee subscription scheduling',
    'grind options',
    'coffee subscription crm',
    'brewing guides',
    'coffee subscription business',
    'origin stories',
    'coffee subscription pos',
    'single origin',
    'coffee subscription operations',
    'fresh roasted',
    'coffee subscription platform',
    'craft coffee',
  ],

  synonyms: [
    'coffee subscription platform',
    'coffee subscription software',
    'roaster club software',
    'bean delivery software',
    'specialty coffee software',
    'roast preferences software',
    'coffee subscription practice software',
    'grind options software',
    'brewing guides software',
    'craft coffee software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Coffee and orders' },
    { id: 'admin', name: 'Roaster Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Subscribers and roasts' },
  ],

  roles: [
    { id: 'admin', name: 'Roaster Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'staff', name: 'Roasting Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a coffee subscription platform',
    'Create a roaster club portal',
    'I need a bean delivery subscription system',
    'Build a specialty coffee subscription platform',
    'Create a roast preference and brewing app',
  ],
};
