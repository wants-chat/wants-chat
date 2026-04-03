/**
 * Marine Supply App Type Definition
 *
 * Complete definition for marine supply and chandlery stores.
 * Essential for marine supply stores, chandleries, and boat parts retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARINE_SUPPLY_APP_TYPE: AppTypeDefinition = {
  id: 'marine-supply',
  name: 'Marine Supply',
  category: 'marine',
  description: 'Marine supply platform with boat parts catalog, fitment lookup, special orders, and loyalty programs',
  icon: 'shopping-bag',

  keywords: [
    'marine supply',
    'chandlery',
    'marine supply software',
    'boat parts',
    'marine store',
    'marine supply management',
    'boating supplies',
    'marine hardware',
    'marine supply scheduling',
    'sailing gear',
    'marine supply crm',
    'marine electronics',
    'marine supply business',
    'boat accessories',
    'marine supply pos',
    'dock supplies',
    'marine supply operations',
    'safety equipment',
    'marine supply services',
    'nautical store',
  ],

  synonyms: [
    'marine supply platform',
    'marine supply software',
    'chandlery software',
    'boat parts software',
    'marine store software',
    'boating supplies software',
    'marine hardware software',
    'sailing gear software',
    'marine electronics software',
    'nautical store software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'auto parts'],

  sections: [
    { id: 'frontend', name: 'Store', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'nautical',

  examplePrompts: [
    'Build a marine supply store platform',
    'Create a boat parts e-commerce app',
    'I need a chandlery inventory system',
    'Build a marine hardware store platform',
    'Create a boating supplies shop app',
  ],
};
