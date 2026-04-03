/**
 * Laundromat App Type Definition
 *
 * Complete definition for laundromat and coin laundry operations.
 * Essential for laundromats, coin laundry, and wash-and-fold services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAUNDROMAT_APP_TYPE: AppTypeDefinition = {
  id: 'laundromat',
  name: 'Laundromat',
  category: 'services',
  description: 'Laundromat platform with machine monitoring, payment processing, wash-fold orders, and loyalty programs',
  icon: 'shirt',

  keywords: [
    'laundromat',
    'coin laundry',
    'laundromat software',
    'wash and fold',
    'self service laundry',
    'laundromat management',
    'machine monitoring',
    'laundromat practice',
    'laundromat scheduling',
    'payment processing',
    'laundromat crm',
    'wash-fold orders',
    'laundromat business',
    'loyalty programs',
    'laundromat pos',
    'dry cleaning',
    'laundromat operations',
    'pickup delivery',
    'laundromat platform',
    'commercial laundry',
  ],

  synonyms: [
    'laundromat platform',
    'laundromat software',
    'coin laundry software',
    'wash and fold software',
    'self service laundry software',
    'machine monitoring software',
    'laundromat practice software',
    'payment processing software',
    'wash-fold orders software',
    'commercial laundry software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and orders' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Machines and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/machines' },
    { id: 'attendant', name: 'Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a laundromat platform',
    'Create a coin laundry portal',
    'I need a wash-fold management system',
    'Build a machine monitoring platform',
    'Create a laundry loyalty app',
  ],
};
