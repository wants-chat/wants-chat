/**
 * Pet Store App Type Definition
 *
 * Complete definition for pet stores and pet supply shops.
 * Essential for pet stores, pet supply retailers, and pet boutiques.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'pet-store',
  name: 'Pet Store',
  category: 'pets',
  description: 'Pet store platform with product catalog, live animal inventory, grooming services, and loyalty programs',
  icon: 'shopping-bag',

  keywords: [
    'pet store',
    'pet shop',
    'pet supply',
    'pet store software',
    'pet retail',
    'pet boutique',
    'pet products',
    'pet food store',
    'pet store pos',
    'pet inventory',
    'pet store crm',
    'pet supply store',
    'pet store management',
    'aquarium store',
    'pet store business',
    'live animals',
    'pet accessories',
    'pet store scheduling',
    'pet store operations',
    'pet retail software',
  ],

  synonyms: [
    'pet store platform',
    'pet store software',
    'pet shop software',
    'pet supply software',
    'pet retail software',
    'pet boutique software',
    'pet store pos software',
    'pet inventory software',
    'pet store management software',
    'pet supply store software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'app store'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Shop and services' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'inventory',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet store ecommerce platform',
    'Create a pet supply shop app',
    'I need a pet boutique management system',
    'Build a pet store inventory app',
    'Create a pet retail platform',
  ],
};
