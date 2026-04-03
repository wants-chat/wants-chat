/**
 * Archery Range App Type Definition
 *
 * Complete definition for archery range operations.
 * Essential for archery ranges, bow sports, and target shooting facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARCHERY_RANGE_APP_TYPE: AppTypeDefinition = {
  id: 'archery-range',
  name: 'Archery Range',
  category: 'sports',
  description: 'Archery range platform with lane scheduling, equipment rental, lesson booking, and league management',
  icon: 'target',

  keywords: [
    'archery range',
    'bow sports',
    'archery range software',
    'target shooting',
    'archery club',
    'archery range management',
    'lane scheduling',
    'archery range practice',
    'archery range scheduling',
    'equipment rental',
    'archery range crm',
    'lesson booking',
    'archery range business',
    'league management',
    'archery range pos',
    'crossbow',
    'archery range operations',
    'indoor archery',
    'archery range platform',
    'youth archery',
  ],

  synonyms: [
    'archery range platform',
    'archery range software',
    'bow sports software',
    'target shooting software',
    'archery club software',
    'lane scheduling software',
    'archery range practice software',
    'equipment rental software',
    'lesson booking software',
    'crossbow software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lanes and lessons' },
    { id: 'admin', name: 'Range Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Lanes and members' },
  ],

  roles: [
    { id: 'admin', name: 'Range Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Archery Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Range Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lanes' },
    { id: 'member', name: 'Archer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build an archery range platform',
    'Create a bow sports facility app',
    'I need an archery club system',
    'Build a target shooting range app',
    'Create an archery range portal',
  ],
};
