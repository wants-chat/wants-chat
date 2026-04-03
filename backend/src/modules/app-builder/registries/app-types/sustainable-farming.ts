/**
 * Sustainable Farming App Type Definition
 *
 * Complete definition for sustainable farming operations.
 * Essential for organic farms, regenerative agriculture, and eco-friendly farm operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABLE_FARMING_APP_TYPE: AppTypeDefinition = {
  id: 'sustainable-farming',
  name: 'Sustainable Farming',
  category: 'agriculture',
  description: 'Sustainable farming platform with crop planning, certification tracking, direct sales, and environmental monitoring',
  icon: 'sprout',

  keywords: [
    'sustainable farming',
    'organic farm',
    'sustainable farming software',
    'regenerative agriculture',
    'eco farming',
    'sustainable farming management',
    'crop planning',
    'sustainable farming practice',
    'sustainable farming scheduling',
    'certification tracking',
    'sustainable farming crm',
    'direct sales',
    'sustainable farming business',
    'environmental monitoring',
    'sustainable farming pos',
    'permaculture',
    'sustainable farming operations',
    'biodynamic',
    'sustainable farming platform',
    'carbon farming',
  ],

  synonyms: [
    'sustainable farming platform',
    'sustainable farming software',
    'organic farm software',
    'regenerative agriculture software',
    'eco farming software',
    'crop planning software',
    'sustainable farming practice software',
    'certification tracking software',
    'direct sales software',
    'permaculture software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and CSA' },
    { id: 'admin', name: 'Farm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Crops and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Farm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Farm Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/crops' },
    { id: 'worker', name: 'Farm Worker', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'organic',

  examplePrompts: [
    'Build a sustainable farming platform',
    'Create an organic farm app',
    'I need a regenerative agriculture system',
    'Build an eco-friendly farm management app',
    'Create a sustainable farming portal',
  ],
};
