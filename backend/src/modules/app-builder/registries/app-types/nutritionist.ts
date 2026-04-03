/**
 * Nutritionist App Type Definition
 *
 * Complete definition for nutrition consulting services.
 * Essential for nutritionists, dietitians, and nutrition coaching.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NUTRITIONIST_APP_TYPE: AppTypeDefinition = {
  id: 'nutritionist',
  name: 'Nutritionist',
  category: 'personal-services',
  description: 'Nutrition consulting platform with meal planning, client tracking, dietary analysis, and appointment scheduling',
  icon: 'apple',

  keywords: [
    'nutritionist',
    'dietitian',
    'nutritionist software',
    'meal planning',
    'dietary consulting',
    'nutritionist management',
    'client tracking',
    'nutritionist practice',
    'nutritionist scheduling',
    'dietary analysis',
    'nutritionist crm',
    'weight management',
    'nutritionist business',
    'food logging',
    'nutritionist pos',
    'nutrition coaching',
    'nutritionist operations',
    'macro tracking',
    'nutritionist platform',
    'health assessment',
  ],

  synonyms: [
    'nutritionist platform',
    'nutritionist software',
    'dietitian software',
    'meal planning software',
    'dietary consulting software',
    'client tracking software',
    'nutritionist practice software',
    'dietary analysis software',
    'weight management software',
    'nutrition coaching software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Meals and tracking' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and plans' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'nutritionist', name: 'Lead Nutritionist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'staff', name: 'Nutrition Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'concert-tickets'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'healthcare',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'healthcare',

  examplePrompts: [
    'Build a nutritionist practice platform',
    'Create a dietitian client portal',
    'I need a meal planning and tracking system',
    'Build a nutrition consulting platform',
    'Create a dietary analysis and coaching app',
  ],
};
