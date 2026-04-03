/**
 * Meal Prep App Type Definition
 *
 * Complete definition for meal prep services and ready-to-eat food businesses.
 * Essential for meal prep companies, ready meal producers, and healthy meal services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEAL_PREP_APP_TYPE: AppTypeDefinition = {
  id: 'meal-prep',
  name: 'Meal Prep',
  category: 'food-production',
  description: 'Meal prep platform with menu planning, subscription management, nutritional tracking, and delivery scheduling',
  icon: 'package',

  keywords: [
    'meal prep',
    'ready meals',
    'meal prep software',
    'healthy meals',
    'meal delivery',
    'meal prep management',
    'subscription meals',
    'meal prep practice',
    'meal prep scheduling',
    'fitness meals',
    'meal prep crm',
    'macro tracking',
    'meal prep business',
    'weekly meals',
    'meal prep pos',
    'diet meals',
    'meal prep operations',
    'portion control',
    'meal prep services',
    'prepared foods',
  ],

  synonyms: [
    'meal prep platform',
    'meal prep software',
    'ready meals software',
    'healthy meals software',
    'meal delivery software',
    'subscription meals software',
    'meal prep practice software',
    'fitness meals software',
    'macro tracking software',
    'prepared foods software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Menus and subscriptions' },
    { id: 'admin', name: 'Prep Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and production' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chef', name: 'Head Chef', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/menu' },
    { id: 'staff', name: 'Kitchen Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'food-ordering',
    'kitchen-display',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'pos-system',
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-production',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'health',

  examplePrompts: [
    'Build a meal prep service platform',
    'Create a ready meals ordering portal',
    'I need a meal prep business management system',
    'Build a healthy meal subscription platform',
    'Create a meal prep and delivery app',
  ],
};
