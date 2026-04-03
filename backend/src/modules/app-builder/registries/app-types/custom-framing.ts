/**
 * Custom Framing App Type Definition
 *
 * Complete definition for custom picture framing operations.
 * Essential for frame shops, art framers, and conservation framing specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOM_FRAMING_APP_TYPE: AppTypeDefinition = {
  id: 'custom-framing',
  name: 'Custom Framing',
  category: 'retail',
  description: 'Custom framing platform with order management, design visualization, material inventory, and pickup scheduling',
  icon: 'frame',

  keywords: [
    'custom framing',
    'frame shop',
    'custom framing software',
    'art framing',
    'conservation framing',
    'custom framing management',
    'order management',
    'custom framing practice',
    'custom framing scheduling',
    'design visualization',
    'custom framing crm',
    'material inventory',
    'custom framing business',
    'pickup scheduling',
    'custom framing pos',
    'moulding',
    'custom framing operations',
    'matting',
    'custom framing platform',
    'shadow boxes',
  ],

  synonyms: [
    'custom framing platform',
    'custom framing software',
    'frame shop software',
    'art framing software',
    'conservation framing software',
    'order management software',
    'custom framing practice software',
    'design visualization software',
    'material inventory software',
    'moulding software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and pickup' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'framer', name: 'Master Framer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
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
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a custom framing platform',
    'Create a frame shop portal',
    'I need an art framing system',
    'Build a framing order platform',
    'Create a picture framing app',
  ],
};
