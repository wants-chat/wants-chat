/**
 * Pet Subscription App Type Definition
 *
 * Complete definition for pet subscription box services.
 * Essential for pet boxes, pet supplies subscription, and pet treats delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'pet-subscription',
  name: 'Pet Subscription',
  category: 'subscription',
  description: 'Pet subscription platform with pet profiles, toy preferences, treat allergies, and themed boxes',
  icon: 'paw-print',

  keywords: [
    'pet subscription',
    'pet box',
    'pet subscription software',
    'pet supplies',
    'pet treats',
    'pet subscription management',
    'pet profiles',
    'pet subscription practice',
    'pet subscription scheduling',
    'toy preferences',
    'pet subscription crm',
    'treat allergies',
    'pet subscription business',
    'themed boxes',
    'pet subscription pos',
    'dog subscription',
    'pet subscription operations',
    'cat subscription',
    'pet subscription platform',
    'pet goodies',
  ],

  synonyms: [
    'pet subscription platform',
    'pet subscription software',
    'pet box software',
    'pet supplies software',
    'pet treats software',
    'pet profiles software',
    'pet subscription practice software',
    'toy preferences software',
    'treat allergies software',
    'pet goodies software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Boxes and preferences' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Subscribers and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Product Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/selections' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/packing' },
    { id: 'subscriber', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pet',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a pet subscription box platform',
    'Create a dog treats subscription portal',
    'I need a pet supplies subscription system',
    'Build a themed pet box platform',
    'Create a pet profile and preferences app',
  ],
};
