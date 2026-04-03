/**
 * Kids Activity Center App Type Definition
 *
 * Complete definition for kids activity centers and play spaces.
 * Essential for indoor playgrounds, kids gyms, and children's activity centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_ACTIVITY_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'kids-activity-center',
  name: 'Kids Activity Center',
  category: 'children',
  description: 'Kids activity center platform with class booking, birthday parties, membership management, and waiver collection',
  icon: 'star',

  keywords: [
    'kids activity center',
    'indoor playground',
    'kids gym',
    'activity center software',
    'childrens activities',
    'kids play center',
    'kids classes',
    'kids birthday parties',
    'activity scheduling',
    'kids entertainment',
    'activity center crm',
    'play space',
    'activity center business',
    'kids programs',
    'activity center pos',
    'toddler activities',
    'activity center management',
    'kids memberships',
    'activity center services',
    'family entertainment',
  ],

  synonyms: [
    'kids activity center platform',
    'kids activity center software',
    'indoor playground software',
    'kids gym software',
    'childrens activity software',
    'kids play center software',
    'kids class software',
    'kids birthday software',
    'activity center management software',
    'kids entertainment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness adults', 'senior center'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and parties' },
    { id: 'admin', name: 'Activity Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Programs and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkin' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'gallery',
    'waitlist',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a kids activity center platform',
    'Create an indoor playground booking app',
    'I need a kids gym membership system',
    'Build a birthday party booking platform',
    'Create a kids class scheduling app',
  ],
};
