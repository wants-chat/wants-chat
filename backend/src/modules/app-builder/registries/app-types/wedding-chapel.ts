/**
 * Wedding Chapel App Type Definition
 *
 * Complete definition for wedding chapels and ceremony venues.
 * Essential for wedding chapels, ceremony venues, and elopement services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_CHAPEL_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-chapel',
  name: 'Wedding Chapel',
  category: 'religious',
  description: 'Wedding chapel platform with ceremony booking, package management, officiant scheduling, and vendor coordination',
  icon: 'heart',

  keywords: [
    'wedding chapel',
    'ceremony venue',
    'wedding chapel software',
    'elopement',
    'wedding booking',
    'wedding chapel management',
    'officiant',
    'wedding packages',
    'wedding scheduling',
    'vow renewal',
    'wedding chapel crm',
    'marriage ceremony',
    'wedding chapel business',
    'chapel rental',
    'wedding chapel pos',
    'wedding coordinator',
    'wedding chapel operations',
    'intimate wedding',
    'wedding chapel services',
    'destination wedding',
  ],

  synonyms: [
    'wedding chapel platform',
    'wedding chapel software',
    'ceremony venue software',
    'elopement software',
    'wedding booking software',
    'wedding package software',
    'officiant scheduling software',
    'wedding chapel management software',
    'ceremony booking software',
    'wedding venue software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'wedding planning'],

  sections: [
    { id: 'frontend', name: 'Couple Portal', enabled: true, basePath: '/', layout: 'public', description: 'Packages and booking' },
    { id: 'admin', name: 'Chapel Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Ceremonies and schedule' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Chapel Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'coordinator', name: 'Wedding Coordinator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/ceremonies' },
    { id: 'officiant', name: 'Officiant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'couple', name: 'Couple', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'romantic',

  examplePrompts: [
    'Build a wedding chapel booking platform',
    'Create an elopement ceremony app',
    'I need a wedding chapel package management system',
    'Build a ceremony venue scheduling platform',
    'Create an officiant coordination app',
  ],
};
