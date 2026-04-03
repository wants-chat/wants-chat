/**
 * Salon & Spa Booking App Type Definition
 *
 * Complete definition for salon and spa booking applications.
 * Essential for beauty salons, spas, barbershops, and wellness centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALON_APP_TYPE: AppTypeDefinition = {
  id: 'salon',
  name: 'Salon & Spa Booking',
  category: 'booking',
  description: 'Salon booking with services, stylists, appointments, and client management',
  icon: 'scissors',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'salon',
    'salon booking',
    'spa',
    'spa booking',
    'beauty salon',
    'hair salon',
    'barbershop',
    'barber',
    'nail salon',
    'beauty parlor',
    'beauty parlour',
    'wellness center',
    'massage',
    'facial',
    'manicure',
    'pedicure',
    'haircut',
    'stylist',
    'hairdresser',
    'beautician',
    'fresha',
    'vagaro',
    'booksy',
    'squire',
    'styleseat',
    'salon software',
    'spa software',
    'beauty booking',
  ],

  synonyms: [
    'beauty booking',
    'salon app',
    'spa app',
    'beauty app',
    'salon system',
    'spa system',
    'beauty platform',
    'salon platform',
    'beauty business',
    'salon management',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant',
    'fitness',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Booking Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Client-facing booking and service information',
    },
    {
      id: 'admin',
      name: 'Salon Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Salon management and appointment scheduling',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Salon Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/appointments',
    },
    {
      id: 'staff',
      name: 'Stylist/Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/my-schedule',
    },
    {
      id: 'client',
      name: 'Client',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/book',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'appointments',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'scheduling',
    'inventory',
    'reviews',
    'gallery',
    'reminders',
    'waitlist',
    'comments',
    'feedback',
    'reporting',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a salon booking app',
    'Create a spa booking system',
    'I need a beauty salon booking platform',
    'Build a barbershop booking app',
    'Create a salon management system',
    'I want to build a salon app like Fresha',
    'Make a salon booking app with staff scheduling',
  ],
};
