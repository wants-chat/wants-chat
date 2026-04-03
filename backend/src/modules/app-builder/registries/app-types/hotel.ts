/**
 * Hotel & Accommodation App Type Definition
 *
 * Complete definition for hotel booking and accommodation applications.
 * Essential for hotels, vacation rentals, B&Bs, and hospitality businesses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOTEL_APP_TYPE: AppTypeDefinition = {
  id: 'hotel',
  name: 'Hotel & Accommodation',
  category: 'hospitality',
  description: 'Hotel booking platform with rooms, reservations, guest management, and channel management',
  icon: 'hotel',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'hotel',
    'hotel booking',
    'accommodation',
    'lodging',
    'vacation rental',
    'airbnb',
    'booking.com',
    'expedia',
    'hotel management',
    'room booking',
    'resort',
    'motel',
    'bed and breakfast',
    'b&b',
    'hostel',
    'guest house',
    'inn',
    'hospitality',
    'hotel reservation',
    'room reservation',
    'check-in',
    'check-out',
    'front desk',
    'property booking',
    'pms',
    'property management system',
  ],

  synonyms: [
    'hotel platform',
    'accommodation platform',
    'booking platform',
    'hotel software',
    'hotel system',
    'reservation system',
    'lodging platform',
    'hospitality software',
    'hotel app',
    'booking app',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'ecommerce',
    'restaurant only',
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
      description: 'Guest-facing booking and information'
    },
    {
      id: 'admin',
      name: 'Hotel Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'staff',
      layout: 'admin',
      description: 'Hotel management and operations'
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Hotel Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard'
    },
    {
      id: 'manager',
      name: 'Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/reservations'
    },
    {
      id: 'staff',
      name: 'Front Desk Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/check-in'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      level: 30,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/housekeeping'
    },
    {
      id: 'guest',
      name: 'Guest',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/book'
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'room-booking',
    'housekeeping',
    'guest-services',
    'channel-manager',
    'rate-management',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'discounts',
    'reporting',
    'analytics',
    'invoicing',
    'team-management',
    'messaging',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a hotel booking platform',
    'Create a vacation rental app like Airbnb',
    'I need a hotel management system',
    'Build a room reservation platform',
    'Create a hotel booking website',
    'I want to build a hospitality booking app',
    'Make a hotel app with channel management',
  ],
};
