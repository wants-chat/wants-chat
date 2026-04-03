/**
 * Pressure Washing App Type Definition
 *
 * Complete definition for pressure washing and power washing applications.
 * Essential for pressure washing companies and exterior cleaning services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRESSURE_WASHING_APP_TYPE: AppTypeDefinition = {
  id: 'pressure-washing',
  name: 'Pressure Washing',
  category: 'services',
  description: 'Pressure washing platform with booking, quotes, route planning, and before/after documentation',
  icon: 'spray-can',

  keywords: [
    'pressure washing',
    'power washing',
    'soft washing',
    'exterior cleaning',
    'driveway cleaning',
    'deck cleaning',
    'house washing',
    'roof cleaning',
    'concrete cleaning',
    'patio cleaning',
    'fence cleaning',
    'commercial pressure washing',
    'residential pressure washing',
    'graffiti removal',
    'gum removal',
    'fleet washing',
    'parking lot cleaning',
    'surface cleaning',
    'mold removal',
    'algae removal',
    'power wash',
    'pressure wash service',
  ],

  synonyms: [
    'pressure washing platform',
    'pressure washing software',
    'power washing app',
    'pressure washing management',
    'exterior cleaning software',
    'pressure washing business app',
    'power washing software',
    'pressure wash scheduling',
    'surface cleaning app',
    'pressure washing dispatch',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and get instant quotes' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Job and route management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'gallery',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'reviews',
    'invoicing',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a pressure washing business platform',
    'Create a power washing booking app',
    'I need a pressure washing quote calculator',
    'Build a pressure washing company management app',
    'Create a soft washing service platform',
  ],
};
