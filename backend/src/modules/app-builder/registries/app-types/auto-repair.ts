/**
 * Auto Repair & Mechanic App Type Definition
 *
 * Complete definition for auto repair and mechanic shop applications.
 * Essential for auto repair shops, mechanics, and automotive service centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'auto-repair',
  name: 'Auto Repair & Mechanic',
  category: 'services',
  description: 'Auto repair platform with appointment booking, service tracking, estimates, and customer management',
  icon: 'car',

  keywords: [
    'auto repair',
    'mechanic',
    'car repair',
    'automotive',
    'auto shop',
    'garage',
    'oil change',
    'brake service',
    'tire service',
    'midas',
    'firestone',
    'jiffy lube',
    'pep boys',
    'car maintenance',
    'auto service',
    'vehicle repair',
    'engine repair',
    'transmission',
    'auto diagnostics',
    'car inspection',
    'auto body',
    'collision repair',
  ],

  synonyms: [
    'auto repair platform',
    'mechanic software',
    'auto shop app',
    'car repair software',
    'automotive service software',
    'garage management',
    'auto repair shop app',
    'mechanic booking',
    'auto service platform',
    'vehicle repair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book appointments and track repairs' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Shop operations and job management' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/work-orders' },
    { id: 'advisor', name: 'Service Advisor', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-vehicles' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-history',
    'recalls-tracking',
    'appointments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'vehicle-inventory',
    'gallery',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an auto repair shop management platform',
    'Create a mechanic booking app',
    'I need an automotive service center software',
    'Build a car repair shop app with estimates',
    'Create an auto shop management system',
  ],
};
