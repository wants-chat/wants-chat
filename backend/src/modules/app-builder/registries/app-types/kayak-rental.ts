/**
 * Kayak Rental App Type Definition
 *
 * Complete definition for kayak and canoe rental operations.
 * Essential for kayak rentals, paddleboard rentals, and canoe outfitters.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KAYAK_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'kayak-rental',
  name: 'Kayak Rental',
  category: 'marine',
  description: 'Kayak rental platform with equipment booking, guided tours, shuttle services, and safety orientation',
  icon: 'activity',

  keywords: [
    'kayak rental',
    'canoe rental',
    'kayak software',
    'paddleboard rental',
    'kayak booking',
    'kayak management',
    'paddle sports',
    'kayak outfitter',
    'kayak scheduling',
    'SUP rental',
    'kayak crm',
    'kayak tours',
    'kayak business',
    'kayak shuttle',
    'kayak pos',
    'river kayaking',
    'kayak operations',
    'eco tours',
    'kayak services',
    'outdoor recreation',
  ],

  synonyms: [
    'kayak rental platform',
    'kayak rental software',
    'canoe rental software',
    'paddleboard rental software',
    'kayak booking software',
    'paddle sports software',
    'kayak outfitter software',
    'SUP rental software',
    'kayak tours software',
    'outdoor recreation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'motorized boats'],

  sections: [
    { id: 'frontend', name: 'Rental Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and tours' },
    { id: 'admin', name: 'Outfitter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'guide', layout: 'admin', description: 'Rentals and tours' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'guide', name: 'Tour Guide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tours' },
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
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build a kayak rental platform',
    'Create a canoe outfitter booking app',
    'I need a paddle sports reservation system',
    'Build a SUP rental scheduling platform',
    'Create a kayak tour booking app',
  ],
};
