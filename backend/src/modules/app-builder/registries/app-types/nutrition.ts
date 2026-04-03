/**
 * Nutrition App Type Definition
 *
 * Complete definition for nutrition and dietitian practice applications.
 * Essential for dietitians, nutritionists, and wellness coaches.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NUTRITION_APP_TYPE: AppTypeDefinition = {
  id: 'nutrition',
  name: 'Nutrition',
  category: 'healthcare',
  description: 'Nutrition practice platform with consultation booking, meal planning, food tracking, and client progress monitoring',
  icon: 'apple',

  keywords: [
    'nutrition',
    'dietitian',
    'nutritionist',
    'diet planning',
    'meal planning',
    'nutrition counseling',
    'registered dietitian',
    'weight management',
    'food tracking',
    'calorie counting',
    'macro tracking',
    'nutrition coaching',
    'sports nutrition',
    'clinical nutrition',
    'eating disorder',
    'diabetes nutrition',
    'heart healthy diet',
    'plant-based nutrition',
    'pediatric nutrition',
    'prenatal nutrition',
    'wellness coaching',
  ],

  synonyms: [
    'nutrition platform',
    'dietitian software',
    'nutritionist software',
    'nutrition practice software',
    'diet planning app',
    'meal planning software',
    'nutrition counseling app',
    'dietitian practice management',
    'nutrition coaching platform',
    'food tracking app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book consultations and track meals' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dietitian', layout: 'admin', description: 'Client management and meal plans' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dietitian', name: 'Registered Dietitian', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'nutritionist', name: 'Nutritionist', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'coach', name: 'Wellness Coach', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/programs' },
    { id: 'assistant', name: 'Admin Assistant', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'analytics',
    'calendar',
    'notifications',
  ],

  optionalFeatures: [
    'payments',
  ],

  incompatibleFeatures: ['course-management-lms', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'healthcare',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'fresh',

  examplePrompts: [
    'Build a nutrition practice platform',
    'Create a dietitian booking app',
    'I need a meal planning and client tracking system',
    'Build a nutrition coaching platform',
    'Create a registered dietitian practice app',
  ],
};
