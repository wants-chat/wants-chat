/**
 * Candle Making App Type Definition
 *
 * Complete definition for candle making and wax craft operations.
 * Essential for candle studios, wax craft workshops, and fragrance artisans.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CANDLE_MAKING_APP_TYPE: AppTypeDefinition = {
  id: 'candle-making',
  name: 'Candle Making',
  category: 'artisan',
  description: 'Candle making platform with class booking, fragrance blending, custom orders, and wholesale management',
  icon: 'flame',

  keywords: [
    'candle making',
    'wax craft',
    'candle making software',
    'fragrance artisan',
    'scented candles',
    'candle making management',
    'class booking',
    'candle making practice',
    'candle making scheduling',
    'fragrance blending',
    'candle making crm',
    'custom orders',
    'candle making business',
    'wholesale management',
    'candle making pos',
    'soy candles',
    'candle making operations',
    'wax melts',
    'candle making platform',
    'home fragrance',
  ],

  synonyms: [
    'candle making platform',
    'candle making software',
    'wax craft software',
    'fragrance artisan software',
    'scented candles software',
    'class booking software',
    'candle making practice software',
    'fragrance blending software',
    'custom orders software',
    'soy candles software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artisan', name: 'Candle Artisan', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'staff', name: 'Shop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a candle making platform',
    'Create a wax craft studio portal',
    'I need a candle class system',
    'Build a custom candle order platform',
    'Create a candle wholesale app',
  ],
};
