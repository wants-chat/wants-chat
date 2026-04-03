/**
 * Vintage Clothing App Type Definition
 *
 * Complete definition for vintage clothing store operations.
 * Essential for vintage boutiques, consignment shops, and retro fashion.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINTAGE_CLOTHING_APP_TYPE: AppTypeDefinition = {
  id: 'vintage-clothing',
  name: 'Vintage Clothing',
  category: 'retail',
  description: 'Vintage clothing platform with era categorization, size charts, consignment tracking, and styling services',
  icon: 'shirt',

  keywords: [
    'vintage clothing',
    'vintage boutique',
    'vintage clothing software',
    'consignment shop',
    'retro fashion',
    'vintage clothing management',
    'era categorization',
    'vintage clothing practice',
    'vintage clothing scheduling',
    'size charts',
    'vintage clothing crm',
    'consignment tracking',
    'vintage clothing business',
    'styling services',
    'vintage clothing pos',
    'designer vintage',
    'vintage clothing operations',
    'curated collections',
    'vintage clothing platform',
    'sustainable fashion',
  ],

  synonyms: [
    'vintage clothing platform',
    'vintage clothing software',
    'vintage boutique software',
    'consignment shop software',
    'retro fashion software',
    'era categorization software',
    'vintage clothing practice software',
    'size charts software',
    'consignment tracking software',
    'sustainable fashion software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fashion and styling' },
    { id: 'admin', name: 'Boutique Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and consignment' },
  ],

  roles: [
    { id: 'admin', name: 'Boutique Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'stylist', name: 'Stylist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'vintage',

  examplePrompts: [
    'Build a vintage clothing platform',
    'Create a vintage boutique portal',
    'I need a consignment shop management system',
    'Build a retro fashion inventory platform',
    'Create an era categorization and styling app',
  ],
};
