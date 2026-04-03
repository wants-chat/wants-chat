/**
 * Cooking School App Type Definition
 *
 * Complete definition for cooking school and culinary education applications.
 * Essential for culinary schools, cooking classes, and chef training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COOKING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'cooking-school',
  name: 'Cooking School',
  category: 'education',
  description: 'Cooking school platform with class booking, recipe libraries, chef profiles, and culinary certifications',
  icon: 'chef-hat',

  keywords: [
    'cooking school',
    'culinary school',
    'cooking classes',
    'culinary arts',
    'chef training',
    'cooking lessons',
    'baking classes',
    'pastry school',
    'culinary academy',
    'cooking workshop',
    'chef school',
    'cooking course',
    'culinary education',
    'recipe class',
    'cooking bootcamp',
    'professional cooking',
    'home cooking',
    'cuisine class',
    'food prep',
    'knife skills',
    'meal prep class',
  ],

  synonyms: [
    'cooking school platform',
    'cooking school software',
    'culinary school software',
    'cooking class booking',
    'culinary education app',
    'chef training software',
    'cooking lessons app',
    'culinary academy software',
    'cooking workshop booking',
    'cooking class management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant delivery'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and book classes' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'chef', layout: 'admin', description: 'Classes and students' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chef', name: 'Head Chef/Instructor', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'instructor', name: 'Instructor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-classes' },
    { id: 'assistant', name: 'Kitchen Assistant', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/prep' },
    { id: 'staff', name: 'Front Desk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'reviews',
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

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a cooking school booking platform',
    'Create a culinary class scheduling app',
    'I need a cooking school management system',
    'Build a chef training academy platform',
    'Create a cooking class with recipe library',
  ],
};
