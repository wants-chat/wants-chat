/**
 * Day Spa App Type Definition
 *
 * Complete definition for day spa services.
 * Essential for day spas, resort spas, and wellness retreats.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DAY_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'day-spa',
  name: 'Day Spa',
  category: 'wellness',
  description: 'Day spa platform with service booking, package management, therapist scheduling, and membership programs',
  icon: 'flower',

  keywords: [
    'day spa',
    'resort spa',
    'day spa software',
    'wellness retreat',
    'spa services',
    'day spa management',
    'service booking',
    'day spa practice',
    'day spa scheduling',
    'package management',
    'day spa crm',
    'facial treatments',
    'day spa business',
    'body treatments',
    'day spa pos',
    'couples spa',
    'day spa operations',
    'spa packages',
    'day spa platform',
    'luxury spa',
  ],

  synonyms: [
    'day spa platform',
    'day spa software',
    'resort spa software',
    'wellness retreat software',
    'spa services software',
    'service booking software',
    'day spa practice software',
    'package management software',
    'facial treatments software',
    'luxury spa software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Spa Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and staff' },
  ],

  roles: [
    { id: 'admin', name: 'Spa Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Spa Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'therapist', name: 'Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'reservations',
    'feedback',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a day spa booking platform',
    'Create a resort spa management portal',
    'I need a spa service booking system',
    'Build a wellness retreat platform',
    'Create a spa package and membership app',
  ],
};
