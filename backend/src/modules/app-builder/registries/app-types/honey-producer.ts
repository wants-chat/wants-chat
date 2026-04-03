/**
 * Honey Producer App Type Definition
 *
 * Complete definition for honey producers and apiary retailers.
 * Essential for beekeepers, honey farms, and artisan honey businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HONEY_PRODUCER_APP_TYPE: AppTypeDefinition = {
  id: 'honey-producer',
  name: 'Honey Producer',
  category: 'food-production',
  description: 'Honey producer platform with hive management, harvest tracking, varietal cataloging, and direct sales',
  icon: 'hexagon',

  keywords: [
    'honey producer',
    'apiary',
    'honey producer software',
    'beekeeper',
    'raw honey',
    'honey producer management',
    'hive tracking',
    'honey producer practice',
    'honey producer scheduling',
    'varietal honey',
    'honey producer crm',
    'local honey',
    'honey producer business',
    'honey harvest',
    'honey producer pos',
    'organic honey',
    'honey producer operations',
    'pollination services',
    'honey producer services',
    'artisan honey',
  ],

  synonyms: [
    'honey producer platform',
    'honey producer software',
    'apiary software',
    'beekeeper software',
    'raw honey software',
    'hive tracking software',
    'honey producer practice software',
    'varietal honey software',
    'honey harvest software',
    'artisan honey software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Honey and products' },
    { id: 'admin', name: 'Producer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Hives and production' },
  ],

  roles: [
    { id: 'admin', name: 'Apiary Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'beekeeper', name: 'Head Beekeeper', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/hives' },
    { id: 'staff', name: 'Apiary Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a honey producer platform',
    'Create an apiary shop portal',
    'I need a beekeeper business management system',
    'Build a honey producer business platform',
    'Create a honey sales and hive tracking app',
  ],
};
