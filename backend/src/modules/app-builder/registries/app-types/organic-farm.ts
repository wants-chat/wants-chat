/**
 * Organic Farm App Type Definition
 *
 * Complete definition for organic farming and certification management applications.
 * Essential for organic farms, CSA operations, and certified organic producers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORGANIC_FARM_APP_TYPE: AppTypeDefinition = {
  id: 'organic-farm',
  name: 'Organic Farm',
  category: 'agriculture',
  description: 'Organic farm platform with certification tracking, CSA management, farm sales, and compliance documentation',
  icon: 'sprout',

  keywords: [
    'organic farm',
    'organic farming',
    'organic certification',
    'csa farm',
    'community supported agriculture',
    'organic produce',
    'organic agriculture',
    'certified organic',
    'organic records',
    'organic compliance',
    'farm share',
    'organic vegetables',
    'organic sales',
    'sustainable farming',
    'organic inputs',
    'organic standards',
    'nop compliance',
    'organic transition',
    'organic market',
    'farm box',
  ],

  synonyms: [
    'organic farm platform',
    'organic farm software',
    'organic certification software',
    'csa management software',
    'organic farming software',
    'farm share software',
    'organic compliance software',
    'organic record keeping',
    'sustainable farm software',
    'organic producer software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'organic chemistry'],

  sections: [
    { id: 'frontend', name: 'Farm Store', enabled: true, basePath: '/', layout: 'public', description: 'Shop and CSA signup' },
    { id: 'admin', name: 'Organic Farm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Production and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Farm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Farm Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'compliance', name: 'Compliance Officer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/certification' },
    { id: 'worker', name: 'Farm Worker', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'member', name: 'CSA Member', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/member' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'organic',

  examplePrompts: [
    'Build an organic farm platform',
    'Create a CSA management app',
    'I need an organic certification tracker',
    'Build a farm share management system',
    'Create an organic farm sales platform',
  ],
};
