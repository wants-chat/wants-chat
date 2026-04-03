/**
 * Waxing Studio App Type Definition
 *
 * Complete definition for waxing and hair removal studio applications.
 * Essential for waxing studios, sugaring salons, and hair removal spas.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAXING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'waxing-studio',
  name: 'Waxing Studio',
  category: 'beauty',
  description: 'Waxing studio platform with booking, treatment tracking, consent forms, and membership management',
  icon: 'sparkles',

  keywords: [
    'waxing studio',
    'waxing salon',
    'waxing software',
    'hair removal',
    'waxing booking',
    'sugaring',
    'waxing appointments',
    'brazilian wax',
    'waxing services',
    'body waxing',
    'waxing scheduling',
    'waxing business',
    'waxing crm',
    'waxing memberships',
    'waxing spa',
    'waxing management',
    'eyebrow waxing',
    'full body wax',
    'waxing packages',
    'waxing pos',
  ],

  synonyms: [
    'waxing studio platform',
    'waxing studio software',
    'waxing salon software',
    'hair removal software',
    'waxing booking software',
    'sugaring software',
    'waxing scheduling software',
    'waxing management software',
    'waxing appointment software',
    'waxing business software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'candle wax'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and packages' },
    { id: 'admin', name: 'Waxing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'esthetician', layout: 'admin', description: 'Appointments and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'esthetician', name: 'Esthetician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'discounts',
    'reviews',
    'waitlist',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a waxing studio booking platform',
    'Create a hair removal salon app',
    'I need a waxing appointment system',
    'Build a sugaring studio app',
    'Create a waxing spa management platform',
  ],
};
