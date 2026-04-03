/**
 * Art School App Type Definition
 *
 * Complete definition for art school and creative education applications.
 * Essential for art schools, studios, workshops, and creative academies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'art-school',
  name: 'Art School',
  category: 'education',
  description: 'Art school platform with class booking, portfolio showcases, instructor profiles, and supply lists',
  icon: 'palette',

  keywords: [
    'art school',
    'art classes',
    'art studio',
    'art lessons',
    'painting classes',
    'drawing classes',
    'sculpture classes',
    'art workshop',
    'fine arts',
    'art academy',
    'art education',
    'creative classes',
    'art instruction',
    'watercolor class',
    'oil painting',
    'figure drawing',
    'pottery classes',
    'ceramics classes',
    'art camp',
    'kids art',
    'adult art classes',
  ],

  synonyms: [
    'art school platform',
    'art school software',
    'art class booking',
    'art studio software',
    'art education app',
    'art lessons booking',
    'creative school software',
    'art workshop app',
    'art academy software',
    'art class management',
  ],

  negativeKeywords: ['blog', 'portfolio website', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and book art classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Classes and student work' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Art Instructor', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Teaching Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/studio' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'course-management',
    'student-records',
    'attendance',
    'class-roster',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'analytics',
    'certificates',
    'transcripts',
    'enrollment',
    'grading',
  ],

  incompatibleFeatures: ['medical-records', 'inventory-warehouse', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build an art school booking platform',
    'Create an art class scheduling app',
    'I need an art studio management system',
    'Build an art academy with student galleries',
    'Create a painting classes booking app',
  ],
};
