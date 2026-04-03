/**
 * Art Supply Store App Type Definition
 *
 * Complete definition for art supply store operations.
 * Essential for art supply shops, craft stores, and artist material retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_SUPPLY_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'art-supply-store',
  name: 'Art Supply Store',
  category: 'retail',
  description: 'Art supply platform with inventory management, workshop scheduling, custom framing, and loyalty programs',
  icon: 'palette',

  keywords: [
    'art supply store',
    'art supply shop',
    'art supply store software',
    'craft store',
    'artist materials',
    'art supply store management',
    'inventory management',
    'art supply store practice',
    'art supply store scheduling',
    'workshop scheduling',
    'art supply store crm',
    'custom framing',
    'art supply store business',
    'loyalty programs',
    'art supply store pos',
    'paint supplies',
    'art supply store operations',
    'canvas materials',
    'art supply store platform',
    'fine art supplies',
  ],

  synonyms: [
    'art supply store platform',
    'art supply store software',
    'art supply shop software',
    'craft store software',
    'artist materials software',
    'inventory management software',
    'art supply store practice software',
    'workshop scheduling software',
    'custom framing software',
    'paint supplies software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Art Shop', enabled: true, basePath: '/', layout: 'public', description: 'Supplies and workshops' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and framing' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'framer', name: 'Custom Framer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/framing' },
    { id: 'artist', name: 'Artist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'rainbow',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build an art supply store platform',
    'Create an art supply shop app',
    'I need a craft store system',
    'Build an artist materials retailer app',
    'Create an art supply store portal',
  ],
};
