/**
 * Medical Transport App Type Definition
 *
 * Complete definition for non-emergency medical transportation operations.
 * Essential for NEMT providers, wheelchair transport, and medical shuttle services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICAL_TRANSPORT_APP_TYPE: AppTypeDefinition = {
  id: 'medical-transport',
  name: 'Medical Transport',
  category: 'healthcare',
  description: 'Medical transport platform with trip scheduling, route optimization, driver management, and insurance billing',
  icon: 'ambulance',

  keywords: [
    'medical transport',
    'nemt',
    'medical transport software',
    'wheelchair transport',
    'medical shuttle',
    'medical transport management',
    'trip scheduling',
    'medical transport practice',
    'medical transport scheduling',
    'route optimization',
    'medical transport crm',
    'driver management',
    'medical transport business',
    'insurance billing',
    'medical transport pos',
    'stretcher transport',
    'medical transport operations',
    'dialysis transport',
    'medical transport platform',
    'medicaid transport',
  ],

  synonyms: [
    'medical transport platform',
    'medical transport software',
    'nemt software',
    'wheelchair transport software',
    'medical shuttle software',
    'trip scheduling software',
    'medical transport practice software',
    'route optimization software',
    'driver management software',
    'stretcher transport software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Booking Portal', enabled: true, basePath: '/', layout: 'public', description: 'Trips and tracking' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Routes and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'customer', name: 'Patient', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'patient-records',
    'insurance-billing',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'referrals',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a medical transport platform',
    'Create a NEMT booking app',
    'I need a wheelchair transport system',
    'Build a medical shuttle service app',
    'Create a non-emergency medical transport platform',
  ],
};
