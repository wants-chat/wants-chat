/**
 * Appliance Repair App Type Definition
 *
 * Complete definition for appliance repair service applications.
 * Essential for appliance repair companies, technicians, and service centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPLIANCE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'appliance-repair',
  name: 'Appliance Repair',
  category: 'services',
  description: 'Appliance repair platform with service booking, diagnostics, parts ordering, and technician dispatch',
  icon: 'blender',

  keywords: [
    'appliance repair',
    'appliance service',
    'washer repair',
    'dryer repair',
    'refrigerator repair',
    'dishwasher repair',
    'oven repair',
    'stove repair',
    'microwave repair',
    'appliance technician',
    'home appliance',
    'sears home services',
    'mr appliance',
    'whirlpool service',
    'samsung repair',
    'lg repair',
    'ge appliance',
    'appliance parts',
    'appliance maintenance',
    'commercial appliance',
    'appliance installation',
    'appliance warranty',
  ],

  synonyms: [
    'appliance repair platform',
    'appliance service software',
    'appliance repair app',
    'appliance technician software',
    'appliance repair management',
    'home appliance software',
    'appliance dispatch',
    'appliance repair business app',
    'appliance service scheduling',
    'appliance repair dispatch',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book repairs and track service' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Dispatch and parts management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/my-appliances' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'gallery',
    'time-tracking',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an appliance repair service platform',
    'Create an appliance technician dispatch app',
    'I need an appliance repair business software',
    'Build a home appliance service booking app',
    'Create an appliance repair company management system',
  ],
};
