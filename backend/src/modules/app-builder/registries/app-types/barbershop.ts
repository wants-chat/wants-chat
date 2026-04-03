/**
 * Barbershop App Type Definition
 *
 * Complete definition for barbershop and men's grooming applications.
 * Essential for barbershops, barber chains, and men's grooming salons.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BARBERSHOP_APP_TYPE: AppTypeDefinition = {
  id: 'barbershop',
  name: 'Barbershop',
  category: 'beauty',
  description: 'Barbershop platform with booking, barber scheduling, walk-in management, and customer loyalty',
  icon: 'scissors',

  keywords: [
    'barbershop',
    'barber shop',
    'barber software',
    'barber booking',
    'barber scheduling',
    'mens grooming',
    'barber appointments',
    'haircut booking',
    'barber business',
    'barber crm',
    'barber queue',
    'walk-in management',
    'barber chair',
    'barber loyalty',
    'barber shop software',
    'mens haircuts',
    'barber app',
    'barber management',
    'barber pos',
    'barber tips',
  ],

  synonyms: [
    'barbershop platform',
    'barbershop software',
    'barber booking software',
    'barber scheduling software',
    'barber shop software',
    'barber management software',
    'mens grooming software',
    'barber appointment software',
    'barber business software',
    'barber pos software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'barber college'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and queue' },
    { id: 'admin', name: 'Barbershop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'barber', layout: 'admin', description: 'Schedule and clients' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'barber', name: 'Barber', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'reviews',
    'subscriptions',
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

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a barbershop booking platform',
    'Create a barber scheduling app',
    'I need a barbershop management system',
    'Build a mens grooming app',
    'Create a barber appointment platform',
  ],
};
