/**
 * Flower Subscription App Type Definition
 *
 * Complete definition for flower subscription services.
 * Essential for flower subscriptions, floral clubs, and bouquet delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOWER_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'flower-subscription',
  name: 'Flower Subscription',
  category: 'subscription',
  description: 'Flower subscription platform with style preferences, delivery scheduling, care instructions, and seasonal selections',
  icon: 'flower2',

  keywords: [
    'flower subscription',
    'floral club',
    'flower subscription software',
    'bouquet delivery',
    'fresh flowers',
    'flower subscription management',
    'style preferences',
    'flower subscription practice',
    'flower subscription scheduling',
    'delivery scheduling',
    'flower subscription crm',
    'care instructions',
    'flower subscription business',
    'seasonal selections',
    'flower subscription pos',
    'farm fresh',
    'flower subscription operations',
    'weekly flowers',
    'flower subscription platform',
    'bloom box',
  ],

  synonyms: [
    'flower subscription platform',
    'flower subscription software',
    'floral club software',
    'bouquet delivery software',
    'fresh flowers software',
    'style preferences software',
    'flower subscription practice software',
    'delivery scheduling software',
    'care instructions software',
    'bloom box software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Flowers and deliveries' },
    { id: 'admin', name: 'Florist Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'florist', name: 'Florist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/arrangements' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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
  industry: 'retail',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a flower subscription platform',
    'Create a floral club portal',
    'I need a bouquet delivery subscription system',
    'Build a fresh flower subscription platform',
    'Create a seasonal selection and delivery app',
  ],
};
