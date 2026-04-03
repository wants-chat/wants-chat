/**
 * Cooking Class App Type Definition
 *
 * Complete definition for culinary education and cooking instruction operations.
 * Essential for cooking schools, culinary academies, and chef training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COOKING_CLASS_APP_TYPE: AppTypeDefinition = {
  id: 'cooking-class',
  name: 'Cooking Class',
  category: 'education',
  description: 'Cooking class platform with class scheduling, recipe library, ingredient prep, and skill progression tracking',
  icon: 'chef-hat',

  keywords: [
    'cooking class',
    'culinary school',
    'cooking class software',
    'chef training',
    'learn to cook',
    'cooking class management',
    'class scheduling',
    'cooking class practice',
    'cooking class scheduling',
    'recipe library',
    'cooking class crm',
    'ingredient prep',
    'cooking class business',
    'skill progression',
    'cooking class pos',
    'baking class',
    'cooking class operations',
    'cuisine courses',
    'cooking class platform',
    'private lessons',
  ],

  synonyms: [
    'cooking class platform',
    'cooking class software',
    'culinary school software',
    'chef training software',
    'learn to cook software',
    'class scheduling software',
    'cooking class practice software',
    'recipe library software',
    'ingredient prep software',
    'baking class software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and recipes' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and instructors' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chef', name: 'Chef Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Kitchen Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/prep' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a cooking class platform',
    'Create a culinary school portal',
    'I need a cooking education system',
    'Build a chef training platform',
    'Create a recipe class app',
  ],
};
