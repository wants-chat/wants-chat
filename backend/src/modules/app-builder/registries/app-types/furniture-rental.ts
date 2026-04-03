/**
 * Furniture Rental App Type Definition
 *
 * Complete definition for furniture rental and staging services.
 * Essential for furniture rentals, home staging, and corporate furnishing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-rental',
  name: 'Furniture Rental',
  category: 'rental',
  description: 'Furniture rental platform with catalog browsing, room planning, delivery management, and lease tracking',
  icon: 'sofa',

  keywords: [
    'furniture rental',
    'home staging',
    'furniture rental software',
    'corporate furniture',
    'temporary furnishing',
    'furniture rental management',
    'catalog browsing',
    'furniture rental practice',
    'furniture rental scheduling',
    'room planning',
    'furniture rental crm',
    'office furniture',
    'furniture rental business',
    'residential rental',
    'furniture rental pos',
    'staging services',
    'furniture rental operations',
    'lease to own',
    'furniture rental platform',
    'student housing',
  ],

  synonyms: [
    'furniture rental platform',
    'furniture rental software',
    'home staging software',
    'corporate furniture software',
    'temporary furnishing software',
    'catalog browsing software',
    'furniture rental practice software',
    'room planning software',
    'office furniture software',
    'staging services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'technology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Furniture and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and leases' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Interior Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/staging' },
    { id: 'delivery', name: 'Delivery Team', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
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
    'discounts',
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'rental',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a furniture rental platform',
    'Create a home staging portal',
    'I need a corporate furniture rental system',
    'Build a furniture leasing platform',
    'Create a catalog and room planning app',
  ],
};
