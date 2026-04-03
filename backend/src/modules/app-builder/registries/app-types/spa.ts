/**
 * Spa App Type Definition
 *
 * Complete definition for spa and wellness center applications.
 * Essential for day spas, resort spas, and wellness centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPA_APP_TYPE: AppTypeDefinition = {
  id: 'spa',
  name: 'Spa',
  category: 'wellness',
  description: 'Spa management platform with booking, treatment menus, therapist scheduling, and client management',
  icon: 'sparkles',

  keywords: [
    'spa',
    'day spa',
    'spa software',
    'spa booking',
    'spa management',
    'wellness center',
    'spa scheduling',
    'spa treatments',
    'massage spa',
    'resort spa',
    'medical spa',
    'spa services',
    'spa appointments',
    'spa therapy',
    'relaxation spa',
    'luxury spa',
    'spa business',
    'spa client management',
    'spa packages',
    'spa memberships',
  ],

  synonyms: [
    'spa platform',
    'spa software',
    'spa management software',
    'spa booking software',
    'spa scheduling software',
    'wellness center software',
    'day spa software',
    'spa appointment software',
    'spa therapy software',
    'spa business software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'hot tub spa'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and services' },
    { id: 'admin', name: 'Spa Dashboard', enabled: true, basePath: '/admin', requiredRole: 'therapist', layout: 'admin', description: 'Appointments and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Spa Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Spa Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'therapist', name: 'Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'receptionist', name: 'Receptionist', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'subscriptions',
    'discounts',
    'inventory',
    'waitlist',
    'feedback',
    'gallery',
    'reviews',
    'email',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a spa booking platform',
    'Create a day spa management app',
    'I need a spa scheduling system',
    'Build a wellness center app',
    'Create a spa appointment system',
  ],
};
