/**
 * Mattress Store App Type Definition
 *
 * Complete definition for mattress retail operations.
 * Essential for mattress stores, sleep shops, and bedding retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MATTRESS_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'mattress-store',
  name: 'Mattress Store',
  category: 'retail',
  description: 'Mattress store platform with sleep assessment, trial management, delivery scheduling, and financing options',
  icon: 'bed',

  keywords: [
    'mattress store',
    'sleep shop',
    'mattress store software',
    'bedding retail',
    'mattress sales',
    'mattress store management',
    'sleep assessment',
    'mattress store practice',
    'mattress store scheduling',
    'trial management',
    'mattress store crm',
    'delivery scheduling',
    'mattress store business',
    'financing options',
    'mattress store pos',
    'adjustable base',
    'mattress store operations',
    'pillows bedding',
    'mattress store platform',
    'sleep technology',
  ],

  synonyms: [
    'mattress store platform',
    'mattress store software',
    'sleep shop software',
    'bedding retail software',
    'mattress sales software',
    'sleep assessment software',
    'mattress store practice software',
    'trial management software',
    'delivery scheduling software',
    'adjustable base software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and sleep quiz' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sales and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'specialist', name: 'Sleep Specialist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/customers' },
    { id: 'sales', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a mattress store platform',
    'Create a sleep shop portal',
    'I need a mattress retail system',
    'Build a sleep assessment platform',
    'Create a mattress delivery app',
  ],
};
