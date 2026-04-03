/**
 * Hot Tub Dealer App Type Definition
 *
 * Complete definition for hot tub and spa retail operations.
 * Essential for hot tub dealers, spa retailers, and wellness equipment sales.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOT_TUB_DEALER_APP_TYPE: AppTypeDefinition = {
  id: 'hot-tub-dealer',
  name: 'Hot Tub Dealer',
  category: 'retail',
  description: 'Hot tub dealer platform with product catalog, delivery scheduling, installation services, and warranty management',
  icon: 'droplet',

  keywords: [
    'hot tub dealer',
    'spa retailer',
    'hot tub dealer software',
    'wellness equipment',
    'swim spa',
    'hot tub dealer management',
    'product catalog',
    'hot tub dealer practice',
    'hot tub dealer scheduling',
    'delivery scheduling',
    'hot tub dealer crm',
    'installation services',
    'hot tub dealer business',
    'warranty management',
    'hot tub dealer pos',
    'jacuzzi',
    'hot tub dealer operations',
    'portable spa',
    'hot tub dealer platform',
    'sauna',
  ],

  synonyms: [
    'hot tub dealer platform',
    'hot tub dealer software',
    'spa retailer software',
    'wellness equipment software',
    'swim spa software',
    'product catalog software',
    'hot tub dealer practice software',
    'delivery scheduling software',
    'installation services software',
    'jacuzzi software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and sales' },
    { id: 'admin', name: 'Dealer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Dealer Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'sales', name: 'Sales Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sales' },
    { id: 'tech', name: 'Install Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/installs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'appointments',
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

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a hot tub dealer platform',
    'Create a spa retailer portal',
    'I need a swim spa sales system',
    'Build a hot tub installation platform',
    'Create a spa dealer app',
  ],
};
