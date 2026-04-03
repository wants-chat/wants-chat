/**
 * Hair Salon App Type Definition
 *
 * Complete definition for hair salon services.
 * Essential for hair salons, barbershops, and styling studios.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_SALON_APP_TYPE: AppTypeDefinition = {
  id: 'hair-salon',
  name: 'Hair Salon',
  category: 'wellness',
  description: 'Hair salon platform with appointment booking, stylist management, service catalog, and client history',
  icon: 'scissors',

  keywords: [
    'hair salon',
    'barbershop',
    'hair salon software',
    'styling studio',
    'hair cutting',
    'hair salon management',
    'appointment booking',
    'hair salon practice',
    'hair salon scheduling',
    'stylist management',
    'hair salon crm',
    'hair coloring',
    'hair salon business',
    'blowouts',
    'hair salon pos',
    'extensions',
    'hair salon operations',
    'treatments',
    'hair salon platform',
    'bridal hair',
  ],

  synonyms: [
    'hair salon platform',
    'hair salon software',
    'barbershop software',
    'styling studio software',
    'hair cutting software',
    'appointment booking software',
    'hair salon practice software',
    'stylist management software',
    'hair coloring software',
    'bridal hair software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and booking' },
    { id: 'admin', name: 'Salon Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Appointments and stylists' },
  ],

  roles: [
    { id: 'admin', name: 'Salon Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'stylist', name: 'Stylist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a hair salon booking platform',
    'Create a barbershop management portal',
    'I need a stylist scheduling system',
    'Build a salon appointment platform',
    'Create a client history and booking app',
  ],
};
