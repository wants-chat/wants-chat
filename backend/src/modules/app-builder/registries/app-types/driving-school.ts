/**
 * Driving School App Type Definition
 *
 * Complete definition for driving school and driver education applications.
 * Essential for driving schools, DMV prep, and driver training centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRIVING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'driving-school',
  name: 'Driving School',
  category: 'education',
  description: 'Driving school platform with lesson scheduling, instructor management, progress tracking, and road test prep',
  icon: 'car',

  keywords: [
    'driving school',
    'driving lessons',
    'driver education',
    'driving instructor',
    'learn to drive',
    'dmv test prep',
    'driving test',
    'road test',
    'behind the wheel',
    'drivers ed',
    'driving course',
    'permit test',
    'teen driving',
    'adult driving',
    'defensive driving',
    'traffic school',
    'driving academy',
    'driving training',
    'learner permit',
    'driving license',
    'driving certification',
  ],

  synonyms: [
    'driving school platform',
    'driving school software',
    'driving lessons app',
    'driver education software',
    'driving instructor software',
    'driving school scheduling',
    'driving lesson booking',
    'drivers ed software',
    'driving academy app',
    'driving training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book lessons and track progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Instructors and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'School Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Office Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Driving Instructor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-lessons' },
    { id: 'receptionist', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'discounts',
    'calendar',
    'notifications',
    'search',
    'student-records',
    'attendance',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'reminders',
    'certificates',
    'transcripts',
    'course-management',
    'enrollment',
    'grading',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a driving school booking platform',
    'Create a driving lessons scheduling app',
    'I need a driver education management system',
    'Build a driving school with instructor scheduling',
    'Create a drivers ed student portal',
  ],
};
