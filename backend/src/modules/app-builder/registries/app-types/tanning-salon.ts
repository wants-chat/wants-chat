/**
 * Tanning Salon App Type Definition
 *
 * Complete definition for tanning salon and spray tan applications.
 * Essential for tanning salons, spray tan studios, and sunless tanning.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TANNING_SALON_APP_TYPE: AppTypeDefinition = {
  id: 'tanning-salon',
  name: 'Tanning Salon',
  category: 'beauty',
  description: 'Tanning salon platform with bed booking, package management, exposure tracking, and customer management',
  icon: 'sun',

  keywords: [
    'tanning salon',
    'tanning bed',
    'tanning software',
    'spray tan',
    'tanning booking',
    'sunless tanning',
    'tanning packages',
    'tanning minutes',
    'tanning business',
    'tanning scheduling',
    'uv tanning',
    'tan studio',
    'tanning membership',
    'tanning salon management',
    'airbrush tan',
    'tanning crm',
    'tanning exposure',
    'tanning lotion',
    'tanning equipment',
    'tanning pos',
  ],

  synonyms: [
    'tanning salon platform',
    'tanning salon software',
    'tanning booking software',
    'spray tan software',
    'tanning scheduling software',
    'tanning management software',
    'sunless tanning software',
    'tanning business software',
    'tanning pos software',
    'tanning membership software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'leather tanning'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and packages' },
    { id: 'admin', name: 'Tanning Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Beds and customers' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkin' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reminders',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a tanning salon platform',
    'Create a spray tan booking app',
    'I need a tanning package management system',
    'Build a tanning studio app',
    'Create a sunless tanning platform',
  ],
};
