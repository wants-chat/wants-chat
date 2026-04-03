/**
 * Ski Resort App Type Definition
 *
 * Complete definition for ski resort and mountain resort applications.
 * Essential for ski resorts, snowboard parks, and mountain destinations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKI_RESORT_APP_TYPE: AppTypeDefinition = {
  id: 'ski-resort',
  name: 'Ski Resort',
  category: 'hospitality',
  description: 'Ski resort platform with lift tickets, equipment rentals, lessons, and mountain conditions',
  icon: 'person-skiing',

  keywords: [
    'ski resort',
    'skiing',
    'snowboarding',
    'ski lift',
    'lift tickets',
    'ski pass',
    'epic pass',
    'ikon pass',
    'ski rental',
    'ski lessons',
    'ski school',
    'mountain resort',
    'snow conditions',
    'trail map',
    'ski lodge',
    'après ski',
    'terrain park',
    'cross country skiing',
    'tubing',
    'winter sports',
    'ski vacation',
    'slope conditions',
  ],

  synonyms: [
    'ski resort platform',
    'ski resort software',
    'mountain resort software',
    'ski ticketing system',
    'ski resort management',
    'ski rental software',
    'ski school software',
    'winter resort app',
    'ski pass system',
    'mountain booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy tickets and check conditions' },
    { id: 'admin', name: 'Resort Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Resort operations and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Resort Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tickets' },
    { id: 'instructor', name: 'Ski Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'rental', name: 'Rental Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'room-booking',
    'guest-services',
    'rate-management',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'housekeeping',
    'channel-manager',
    'menu-management',
    'food-ordering',
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a ski resort ticketing platform',
    'Create a ski rental and lessons app',
    'I need a mountain resort management system',
    'Build a ski resort like Vail or Aspen app',
    'Create a ski pass and conditions app',
  ],
};
