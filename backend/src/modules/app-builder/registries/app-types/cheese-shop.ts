/**
 * Cheese Shop App Type Definition
 *
 * Complete definition for cheese shops and fromageries.
 * Essential for cheesemongers, specialty cheese stores, and artisan dairy retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHEESE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'cheese-shop',
  name: 'Cheese Shop',
  category: 'food-production',
  description: 'Cheese shop platform with cheese catalog, aging tracking, pairing suggestions, and tasting event management',
  icon: 'cheese',

  keywords: [
    'cheese shop',
    'fromagerie',
    'cheese shop software',
    'cheesemonger',
    'specialty cheese',
    'cheese shop management',
    'artisan cheese',
    'cheese shop practice',
    'cheese shop scheduling',
    'cheese aging',
    'cheese shop crm',
    'cheese pairing',
    'cheese shop business',
    'cheese boards',
    'cheese shop pos',
    'cheese tasting',
    'cheese shop operations',
    'imported cheese',
    'cheese shop services',
    'dairy retail',
  ],

  synonyms: [
    'cheese shop platform',
    'cheese shop software',
    'fromagerie software',
    'cheesemonger software',
    'specialty cheese software',
    'artisan cheese software',
    'cheese shop practice software',
    'cheese aging software',
    'cheese pairing software',
    'dairy retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cheeses and events' },
    { id: 'admin', name: 'Cheese Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'cheesemonger', name: 'Cheesemonger', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'table-reservations',
    'payments',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a cheese shop platform',
    'Create a fromagerie ordering portal',
    'I need a specialty cheese shop management system',
    'Build a cheese shop business platform',
    'Create a cheese catalog and tasting app',
  ],
};
