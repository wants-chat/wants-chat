/**
 * Carbon Offset Marketplace App Type Definition
 *
 * Complete definition for carbon offset marketplace operations.
 * Essential for carbon credit trading platforms, offset marketplaces, and emissions trading.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CARBON_OFFSET_MARKETPLACE_APP_TYPE: AppTypeDefinition = {
  id: 'carbon-offset-marketplace',
  name: 'Carbon Offset Marketplace',
  category: 'marketplace',
  description: 'Carbon offset platform with credit listings, verification tracking, transaction management, and impact reporting',
  icon: 'cloud',

  keywords: [
    'carbon offset marketplace',
    'carbon credits',
    'carbon offset marketplace software',
    'emissions trading',
    'offset marketplace',
    'carbon offset marketplace management',
    'credit listings',
    'carbon offset marketplace practice',
    'carbon offset marketplace scheduling',
    'verification tracking',
    'carbon offset marketplace crm',
    'transaction management',
    'carbon offset marketplace business',
    'impact reporting',
    'carbon offset marketplace pos',
    'net zero',
    'carbon offset marketplace operations',
    'climate action',
    'carbon offset marketplace platform',
    'carbon neutral',
  ],

  synonyms: [
    'carbon offset marketplace platform',
    'carbon offset marketplace software',
    'carbon credits software',
    'emissions trading software',
    'offset marketplace software',
    'credit listings software',
    'carbon offset marketplace practice software',
    'verification tracking software',
    'transaction management software',
    'net zero software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Marketplace', enabled: true, basePath: '/', layout: 'public', description: 'Credits and impact' },
    { id: 'admin', name: 'Platform Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Listings and transactions' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'verifier', name: 'Verification Analyst', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/verify' },
    { id: 'seller', name: 'Project Developer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/projects' },
    { id: 'buyer', name: 'Carbon Buyer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'marketplace',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a carbon offset marketplace platform',
    'Create a carbon credit trading app',
    'I need an emissions trading system',
    'Build a carbon neutral marketplace app',
    'Create a carbon offset portal',
  ],
};
