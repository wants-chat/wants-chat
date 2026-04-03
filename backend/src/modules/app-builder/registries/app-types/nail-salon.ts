/**
 * Nail Salon App Type Definition
 *
 * Complete definition for nail salon and nail spa applications.
 * Essential for nail salons, nail bars, and manicure/pedicure businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NAIL_SALON_APP_TYPE: AppTypeDefinition = {
  id: 'nail-salon',
  name: 'Nail Salon',
  category: 'beauty',
  description: 'Nail salon platform with booking, service menu, technician scheduling, and customer management',
  icon: 'palette',

  keywords: [
    'nail salon',
    'nail spa',
    'nail software',
    'nail booking',
    'manicure',
    'pedicure',
    'nail technician',
    'nail appointments',
    'nail art',
    'nail salon scheduling',
    'nail salon business',
    'nail services',
    'gel nails',
    'acrylic nails',
    'nail salon management',
    'nail salon crm',
    'nail bar',
    'nail salon pos',
    'nail design',
    'nail salon software',
  ],

  synonyms: [
    'nail salon platform',
    'nail salon software',
    'nail spa software',
    'nail booking software',
    'nail scheduling software',
    'nail management software',
    'nail salon crm software',
    'nail technician software',
    'nail appointment software',
    'nail salon pos software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'nail hardware'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and services' },
    { id: 'admin', name: 'Nail Salon Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Schedule and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'technician', name: 'Nail Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a nail salon booking platform',
    'Create a nail spa management app',
    'I need a nail salon scheduling system',
    'Build a manicure pedicure booking app',
    'Create a nail technician platform',
  ],
};
