/**
 * Outdoor Gear App Type Definition
 *
 * Complete definition for outdoor gear store operations.
 * Essential for outdoor retailers, adventure shops, and gear outfitters.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTDOOR_GEAR_APP_TYPE: AppTypeDefinition = {
  id: 'outdoor-gear',
  name: 'Outdoor Gear',
  category: 'retail',
  description: 'Outdoor gear platform with product inventory, gear rentals, expert advice, and adventure trip planning',
  icon: 'compass',

  keywords: [
    'outdoor gear',
    'adventure shop',
    'outdoor gear software',
    'gear outfitter',
    'camping equipment',
    'outdoor gear management',
    'product inventory',
    'outdoor gear practice',
    'outdoor gear scheduling',
    'gear rentals',
    'outdoor gear crm',
    'expert advice',
    'outdoor gear business',
    'trip planning',
    'outdoor gear pos',
    'hiking gear',
    'outdoor gear operations',
    'climbing equipment',
    'outdoor gear platform',
    'technical apparel',
  ],

  synonyms: [
    'outdoor gear platform',
    'outdoor gear software',
    'adventure shop software',
    'gear outfitter software',
    'camping equipment software',
    'product inventory software',
    'outdoor gear practice software',
    'gear rentals software',
    'expert advice software',
    'technical apparel software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Gear and adventures' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'expert', name: 'Gear Expert', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/consultations' },
    { id: 'customer', name: 'Adventurer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build an outdoor gear store platform',
    'Create an adventure shop portal',
    'I need a gear outfitter management system',
    'Build an equipment rental platform',
    'Create a gear and trip planning app',
  ],
};
