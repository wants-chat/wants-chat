/**
 * Antique Shop App Type Definition
 *
 * Complete definition for antique shops and vintage retailers.
 * Essential for antique dealers, vintage stores, and collectibles shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANTIQUE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'antique-shop',
  name: 'Antique Shop',
  category: 'retail',
  description: 'Antique shop platform with item provenance, appraisal services, consignment management, and collector networking',
  icon: 'crown',

  keywords: [
    'antique shop',
    'vintage store',
    'antique shop software',
    'collectibles',
    'antique dealer',
    'antique shop management',
    'provenance tracking',
    'antique shop practice',
    'antique shop scheduling',
    'appraisals',
    'antique shop crm',
    'estate sales',
    'antique shop business',
    'consignment',
    'antique shop pos',
    'rare items',
    'antique shop operations',
    'restoration',
    'antique shop services',
    'vintage retail',
  ],

  synonyms: [
    'antique shop platform',
    'antique shop software',
    'vintage store software',
    'collectibles software',
    'antique dealer software',
    'provenance tracking software',
    'antique shop practice software',
    'appraisals software',
    'estate sales software',
    'vintage retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Antiques and services' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and consignments' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dealer', name: 'Antique Dealer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
    { id: 'customer', name: 'Collector', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'vintage',

  examplePrompts: [
    'Build an antique shop platform',
    'Create a vintage store portal',
    'I need an antique dealer management system',
    'Build an antique shop business platform',
    'Create a collectibles and consignment app',
  ],
};
