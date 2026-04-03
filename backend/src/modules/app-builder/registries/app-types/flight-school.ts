/**
 * Flight School App Type Definition
 *
 * Complete definition for flight school and aviation training applications.
 * Essential for flight schools, pilot training, and aviation academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLIGHT_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'flight-school',
  name: 'Flight School',
  category: 'education',
  description: 'Flight school platform with lesson scheduling, aircraft booking, pilot logbook, and certification tracking',
  icon: 'plane',

  keywords: [
    'flight school',
    'pilot training',
    'aviation school',
    'flight lessons',
    'learn to fly',
    'flight instructor',
    'cfi',
    'private pilot',
    'instrument rating',
    'commercial pilot',
    'atp',
    'cessna',
    'piper',
    'flight hours',
    'pilot logbook',
    'ground school',
    'checkride',
    'faa certification',
    'discovery flight',
    'aviation academy',
    'flight simulator',
  ],

  synonyms: [
    'flight school platform',
    'flight school software',
    'pilot training software',
    'aviation training software',
    'flight school scheduling',
    'aircraft booking system',
    'flight lesson booking',
    'pilot school software',
    'aviation academy app',
    'flight training management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book flights and track progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Aircraft and instructor scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'School Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Chief Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Flight Instructor', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-flights' },
    { id: 'dispatcher', name: 'Dispatcher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/aircraft' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student Pilot', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'student-records',
    'course-management',
    'attendance',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'analytics',
    'certificates',
    'transcripts',
    'enrollment',
    'class-roster',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a flight school booking platform',
    'Create a pilot training scheduling app',
    'I need an aviation school management system',
    'Build a flight school with aircraft scheduling',
    'Create a pilot logbook and training tracker',
  ],
};
