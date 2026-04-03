/**
 * Float Therapy App Type Definition
 *
 * Complete definition for float therapy and sensory deprivation center applications.
 * Essential for float centers, float spas, and isolation tank facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOAT_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'float-therapy',
  name: 'Float Therapy',
  category: 'wellness',
  description: 'Float therapy center platform with pod booking, session management, membership tracking, and client management',
  icon: 'water',

  keywords: [
    'float therapy',
    'float center',
    'sensory deprivation',
    'float tank',
    'isolation tank',
    'float spa',
    'float software',
    'float booking',
    'float pod',
    'float session',
    'floatation therapy',
    'float studio',
    'float scheduling',
    'float memberships',
    'float experience',
    'float room',
    'salt water float',
    'float business',
    'float appointments',
    'rest therapy',
  ],

  synonyms: [
    'float therapy platform',
    'float therapy software',
    'float center software',
    'float booking software',
    'float scheduling software',
    'sensory deprivation software',
    'float tank software',
    'float spa software',
    'float pod software',
    'float management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'pool float'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and sessions' },
    { id: 'admin', name: 'Float Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Pods and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Center Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Float Attendant', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'clients',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'waitlist',
    'scheduling',
    'feedback',
    'reminders',
    'reviews',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build a float therapy center platform',
    'Create a float tank booking app',
    'I need a sensory deprivation center system',
    'Build a float spa management app',
    'Create a float pod booking platform',
  ],
};
