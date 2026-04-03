/**
 * Vitamin Subscription App Type Definition
 *
 * Complete definition for vitamin and supplement subscription services.
 * Essential for vitamin subscriptions, supplement packs, and personalized nutrition.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VITAMIN_SUBSCRIPTION_APP_TYPE: AppTypeDefinition = {
  id: 'vitamin-subscription',
  name: 'Vitamin Subscription',
  category: 'subscription',
  description: 'Vitamin subscription platform with health assessments, personalized packs, dosage tracking, and wellness goals',
  icon: 'pill',

  keywords: [
    'vitamin subscription',
    'supplement packs',
    'vitamin subscription software',
    'personalized nutrition',
    'daily vitamins',
    'vitamin subscription management',
    'health assessments',
    'vitamin subscription practice',
    'vitamin subscription scheduling',
    'personalized packs',
    'vitamin subscription crm',
    'dosage tracking',
    'vitamin subscription business',
    'wellness goals',
    'vitamin subscription pos',
    'custom supplements',
    'vitamin subscription operations',
    'health optimization',
    'vitamin subscription platform',
    'nutrient packs',
  ],

  synonyms: [
    'vitamin subscription platform',
    'vitamin subscription software',
    'supplement packs software',
    'personalized nutrition software',
    'daily vitamins software',
    'health assessments software',
    'vitamin subscription practice software',
    'personalized packs software',
    'dosage tracking software',
    'nutrient packs software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Vitamins and tracking' },
    { id: 'admin', name: 'Wellness Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and formulations' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'nutritionist', name: 'Nutritionist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/formulations' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'healthcare',

  examplePrompts: [
    'Build a vitamin subscription platform',
    'Create a personalized supplement portal',
    'I need a custom vitamin pack system',
    'Build a wellness subscription platform',
    'Create a health assessment and tracking app',
  ],
};
