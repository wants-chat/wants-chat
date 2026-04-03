/**
 * Trampoline Park App Type Definition
 *
 * Complete definition for trampoline park and indoor playground applications.
 * Essential for trampoline parks, indoor playgrounds, and adventure parks.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAMPOLINE_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'trampoline-park',
  name: 'Trampoline Park',
  category: 'entertainment',
  description: 'Trampoline park platform with session booking, waiver management, party packages, and capacity control',
  icon: 'arrow-up',

  keywords: [
    'trampoline park',
    'trampoline',
    'sky zone',
    'urban air',
    'launch trampoline',
    'altitude trampoline',
    'jump park',
    'bounce house',
    'indoor playground',
    'ninja course',
    'foam pit',
    'dodgeball',
    'trampoline fitness',
    'trampoline birthday',
    'jump session',
    'trampoline party',
    'jump time',
    'adventure park',
    'indoor park',
    'kids entertainment',
    'family fun',
    'active entertainment',
  ],

  synonyms: [
    'trampoline park platform',
    'trampoline park software',
    'jump park booking',
    'trampoline management',
    'indoor park software',
    'trampoline business app',
    'jump session booking',
    'adventure park software',
    'trampoline scheduling',
    'indoor playground software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness studio'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book sessions and parties' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and capacity management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'staff', name: 'Floor Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'party-host', name: 'Party Host', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/parties' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reservations',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['course-management', 'inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build a trampoline park booking platform',
    'Create an indoor playground management app',
    'I need a trampoline park waiver system',
    'Build a jump park like Sky Zone',
    'Create an adventure park booking system',
  ],
};
