/**
 * Airport Operations App Type Definition
 *
 * Complete definition for airport operations and FBO services.
 * Essential for airports, FBOs, and aviation ground services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRPORT_OPERATIONS_APP_TYPE: AppTypeDefinition = {
  id: 'airport-operations',
  name: 'Airport Operations',
  category: 'aviation',
  description: 'Airport operations platform with flight tracking, FBO services, hangar management, and ground handling',
  icon: 'tower-control',

  keywords: [
    'airport operations',
    'fbo services',
    'airport operations software',
    'ground handling',
    'hangar management',
    'airport operations management',
    'flight tracking',
    'airport operations practice',
    'airport operations scheduling',
    'fuel services',
    'airport operations crm',
    'ramp services',
    'airport operations business',
    'tie-down rentals',
    'airport operations pos',
    'pilot amenities',
    'airport operations operations',
    'aircraft parking',
    'airport operations services',
    'line service',
  ],

  synonyms: [
    'airport operations platform',
    'airport operations software',
    'fbo services software',
    'ground handling software',
    'hangar management software',
    'flight tracking software',
    'airport operations practice software',
    'fuel services software',
    'ramp services software',
    'line service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Pilot Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and requests' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Flights and services' },
  ],

  roles: [
    { id: 'admin', name: 'Airport Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Operations Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/flights' },
    { id: 'lineman', name: 'Line Service Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/services' },
    { id: 'pilot', name: 'Pilot', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an airport operations platform',
    'Create an FBO services portal',
    'I need an airport management system',
    'Build a ground handling service platform',
    'Create a hangar and flight services app',
  ],
};
