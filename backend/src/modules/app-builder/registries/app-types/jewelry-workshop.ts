/**
 * Jewelry Workshop App Type Definition
 *
 * Complete definition for jewelry making and metalsmithing operations.
 * Essential for jewelry workshops, metalsmith studios, and jewelry education.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_WORKSHOP_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry-workshop',
  name: 'Jewelry Workshop',
  category: 'artisan',
  description: 'Jewelry workshop platform with class scheduling, bench rentals, custom commissions, and gallery sales',
  icon: 'gem',

  keywords: [
    'jewelry workshop',
    'metalsmith studio',
    'jewelry workshop software',
    'jewelry making',
    'silversmith',
    'jewelry workshop management',
    'class scheduling',
    'jewelry workshop practice',
    'jewelry workshop scheduling',
    'bench rentals',
    'jewelry workshop crm',
    'custom commissions',
    'jewelry workshop business',
    'gallery sales',
    'jewelry workshop pos',
    'goldsmith',
    'jewelry workshop operations',
    'stone setting',
    'jewelry workshop platform',
    'casting soldering',
  ],

  synonyms: [
    'jewelry workshop platform',
    'jewelry workshop software',
    'metalsmith studio software',
    'jewelry making software',
    'silversmith software',
    'class scheduling software',
    'jewelry workshop practice software',
    'bench rentals software',
    'custom commissions software',
    'goldsmith software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and gallery' },
    { id: 'admin', name: 'Workshop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Benches and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Master Jeweler', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Workshop Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/benches' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
  industry: 'artisan',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a jewelry workshop platform',
    'Create a metalsmith studio portal',
    'I need a jewelry making class system',
    'Build a custom jewelry commission platform',
    'Create a bench rental app',
  ],
};
