/**
 * Wine Club App Type Definition
 *
 * Complete definition for wine club subscription services.
 * Essential for wine clubs, wine subscriptions, and curated wine delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'wine-club',
  name: 'Wine Club',
  category: 'subscription',
  description: 'Wine club platform with wine selection, membership tiers, tasting notes, and cellar tracking',
  icon: 'wine',

  keywords: [
    'wine club',
    'wine subscription',
    'wine club software',
    'curated wine',
    'wine delivery',
    'wine club management',
    'wine selection',
    'wine club practice',
    'wine club scheduling',
    'membership tiers',
    'wine club crm',
    'tasting notes',
    'wine club business',
    'cellar tracking',
    'wine club pos',
    'sommelier picks',
    'wine club operations',
    'wine education',
    'wine club platform',
    'winery direct',
  ],

  synonyms: [
    'wine club platform',
    'wine club software',
    'wine subscription software',
    'curated wine software',
    'wine delivery software',
    'wine selection software',
    'wine club practice software',
    'membership tiers software',
    'tasting notes software',
    'winery direct software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Wines and shipments' },
    { id: 'admin', name: 'Club Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Club Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Club Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shipments' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-beverage',

  defaultColorScheme: 'wine',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a wine club subscription platform',
    'Create a wine subscription portal',
    'I need a wine club membership system',
    'Build a curated wine delivery platform',
    'Create a tasting notes and cellar app',
  ],
};
