/**
 * Jet Ski Rental App Type Definition
 *
 * Complete definition for jet ski and personal watercraft rentals.
 * Essential for PWC rentals, wave runner rentals, and watercraft tours.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JET_SKI_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'jet-ski-rental',
  name: 'Jet Ski Rental',
  category: 'marine',
  description: 'Jet ski rental platform with time-slot booking, waiver management, fleet tracking, and safety briefings',
  icon: 'waves',

  keywords: [
    'jet ski rental',
    'pwc rental',
    'jet ski software',
    'wave runner',
    'jet ski booking',
    'jet ski management',
    'watercraft rental',
    'jet ski fleet',
    'jet ski scheduling',
    'sea-doo rental',
    'jet ski crm',
    'jet ski tours',
    'jet ski business',
    'personal watercraft',
    'jet ski pos',
    'water sports',
    'jet ski operations',
    'hourly rental',
    'jet ski services',
    'beach rentals',
  ],

  synonyms: [
    'jet ski rental platform',
    'jet ski rental software',
    'pwc rental software',
    'wave runner software',
    'jet ski booking software',
    'watercraft rental software',
    'jet ski fleet software',
    'sea-doo rental software',
    'personal watercraft software',
    'water sports rental software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'car rental'],

  sections: [
    { id: 'frontend', name: 'Rental Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fleet and booking' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'attendant', layout: 'admin', description: 'Rentals and fleet' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Dock Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'attendant', name: 'Dock Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
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
  defaultDesignVariant: 'vibrant',

  examplePrompts: [
    'Build a jet ski rental platform',
    'Create a PWC booking app',
    'I need a wave runner rental system',
    'Build a watercraft rental management platform',
    'Create a jet ski tour booking app',
  ],
};
