/**
 * Aviation Charter App Type Definition
 *
 * Complete definition for aviation charter and private jet services.
 * Essential for charter operators, private jet companies, and air taxi services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_CHARTER_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-charter',
  name: 'Aviation Charter',
  category: 'aviation',
  description: 'Aviation charter platform with flight booking, fleet management, crew scheduling, and customer management',
  icon: 'plane',

  keywords: [
    'aviation charter',
    'private jet',
    'aviation charter software',
    'air taxi',
    'charter flights',
    'aviation charter management',
    'flight booking',
    'aviation charter practice',
    'aviation charter scheduling',
    'fleet management',
    'aviation charter crm',
    'jet charter',
    'aviation charter business',
    'crew scheduling',
    'aviation charter pos',
    'empty legs',
    'aviation charter operations',
    'aircraft charter',
    'aviation charter services',
    'on-demand charter',
  ],

  synonyms: [
    'aviation charter platform',
    'aviation charter software',
    'private jet software',
    'air taxi software',
    'charter flights software',
    'flight booking software',
    'aviation charter practice software',
    'fleet management software',
    'jet charter software',
    'on-demand charter software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Booking Portal', enabled: true, basePath: '/', layout: 'public', description: 'Flights and quotes' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Charter Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Flight Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/flights' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'luxury',

  examplePrompts: [
    'Build an aviation charter platform',
    'Create a private jet booking portal',
    'I need a charter flight management system',
    'Build an air taxi service platform',
    'Create a fleet and crew scheduling app',
  ],
};
