/**
 * Tire Shop App Type Definition
 *
 * Complete definition for tire shop and wheel service applications.
 * Essential for tire shops, wheel dealers, and tire service centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TIRE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tire-shop',
  name: 'Tire Shop',
  category: 'automotive',
  description: 'Tire shop platform with inventory management, appointment scheduling, tire finder, and customer management',
  icon: 'circle',

  keywords: [
    'tire shop',
    'tire store',
    'tire service',
    'tire software',
    'wheel shop',
    'tire dealer',
    'tire inventory',
    'tire scheduling',
    'tire installation',
    'tire sales',
    'tire business',
    'tire center',
    'wheel alignment',
    'tire rotation',
    'tire finder',
    'tire quotes',
    'tire repair',
    'tire mounting',
    'tire balancing',
    'tire management',
  ],

  synonyms: [
    'tire shop platform',
    'tire shop software',
    'tire store software',
    'tire service software',
    'wheel shop software',
    'tire dealer software',
    'tire inventory software',
    'tire scheduling software',
    'tire sales software',
    'tire management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'tire swing'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tires and appointments' },
    { id: 'admin', name: 'Tire Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Inventory and service' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'sales', name: 'Sales Associate', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-history',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'recalls-tracking',
    'reviews',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a tire shop platform',
    'Create a tire store management app',
    'I need a tire inventory system',
    'Build a tire service scheduling app',
    'Create a tire shop CRM',
  ],
};
