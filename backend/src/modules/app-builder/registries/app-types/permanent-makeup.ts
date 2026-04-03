/**
 * Permanent Makeup App Type Definition
 *
 * Complete definition for permanent makeup and microblading applications.
 * Essential for PMU artists, microblading studios, and cosmetic tattoo artists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERMANENT_MAKEUP_APP_TYPE: AppTypeDefinition = {
  id: 'permanent-makeup',
  name: 'Permanent Makeup',
  category: 'beauty',
  description: 'Permanent makeup platform with consultation booking, consent forms, touch-up scheduling, and before/after portfolio',
  icon: 'eye',

  keywords: [
    'permanent makeup',
    'microblading',
    'pmu software',
    'cosmetic tattoo',
    'permanent makeup booking',
    'microblading studio',
    'lip blush',
    'eyebrow tattoo',
    'permanent makeup artist',
    'pmu artist',
    'microblading appointments',
    'permanent makeup business',
    'pmu scheduling',
    'ombre brows',
    'permanent eyeliner',
    'pmu crm',
    'permanent makeup studio',
    'microblading management',
    'touch-up scheduling',
    'pmu booking',
  ],

  synonyms: [
    'permanent makeup platform',
    'permanent makeup software',
    'microblading software',
    'pmu software',
    'cosmetic tattoo software',
    'permanent makeup booking software',
    'microblading booking software',
    'pmu artist software',
    'permanent makeup management software',
    'microblading studio software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'regular tattoo'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and gallery' },
    { id: 'admin', name: 'PMU Dashboard', enabled: true, basePath: '/admin', requiredRole: 'artist', layout: 'admin', description: 'Clients and consultations' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Studio Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'artist', name: 'PMU Artist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'gallery',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
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

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a permanent makeup booking platform',
    'Create a microblading studio app',
    'I need a PMU artist scheduling system',
    'Build a cosmetic tattoo management app',
    'Create a permanent makeup consultation platform',
  ],
};
