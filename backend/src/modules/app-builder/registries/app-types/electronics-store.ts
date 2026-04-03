/**
 * Electronics Store App Type Definition
 *
 * Complete definition for electronics stores and consumer tech retailers.
 * Essential for electronics shops, computer stores, and tech accessory retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRONICS_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'electronics-store',
  name: 'Electronics Store',
  category: 'retail',
  description: 'Electronics store platform with product specs, warranty tracking, repair services, and trade-in programs',
  icon: 'smartphone',

  keywords: [
    'electronics store',
    'tech shop',
    'electronics store software',
    'consumer electronics',
    'computer store',
    'electronics store management',
    'gadgets',
    'electronics store practice',
    'electronics store scheduling',
    'tech accessories',
    'electronics store crm',
    'repair services',
    'electronics store business',
    'trade-ins',
    'electronics store pos',
    'warranties',
    'electronics store operations',
    'audio video',
    'electronics store services',
    'tech retail',
  ],

  synonyms: [
    'electronics store platform',
    'electronics store software',
    'tech shop software',
    'consumer electronics software',
    'computer store software',
    'gadgets software',
    'electronics store practice software',
    'tech accessories software',
    'repair services software',
    'tech retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'healthcare'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and services' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and repairs' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'technician', name: 'Repair Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/repairs' },
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
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build an electronics store platform',
    'Create a tech shop portal',
    'I need an electronics retail management system',
    'Build an electronics store business platform',
    'Create a gadget sales and repair app',
  ],
};
