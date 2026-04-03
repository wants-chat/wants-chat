/**
 * Blacksmith Forge App Type Definition
 *
 * Complete definition for blacksmith and metalworking artisan operations.
 * Essential for blacksmith shops, forge studios, and metalwork artisans.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BLACKSMITH_FORGE_APP_TYPE: AppTypeDefinition = {
  id: 'blacksmith-forge',
  name: 'Blacksmith Forge',
  category: 'artisan',
  description: 'Blacksmith forge platform with custom order management, class scheduling, commission tracking, and portfolio showcase',
  icon: 'hammer',

  keywords: [
    'blacksmith forge',
    'metalwork artisan',
    'blacksmith forge software',
    'forge studio',
    'ironwork',
    'blacksmith forge management',
    'custom orders',
    'blacksmith forge practice',
    'blacksmith forge scheduling',
    'class scheduling',
    'blacksmith forge crm',
    'commission tracking',
    'blacksmith forge business',
    'portfolio showcase',
    'blacksmith forge pos',
    'knife making',
    'blacksmith forge operations',
    'decorative iron',
    'blacksmith forge platform',
    'forged art',
  ],

  synonyms: [
    'blacksmith forge platform',
    'blacksmith forge software',
    'metalwork artisan software',
    'forge studio software',
    'ironwork software',
    'custom orders software',
    'blacksmith forge practice software',
    'class scheduling software',
    'commission tracking software',
    'knife making software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Work and classes' },
    { id: 'admin', name: 'Forge Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and commissions' },
  ],

  roles: [
    { id: 'admin', name: 'Master Smith', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'smith', name: 'Journeyman', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'apprentice', name: 'Apprentice', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'artisan',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'rustic',

  examplePrompts: [
    'Build a blacksmith forge platform',
    'Create a metalwork artisan portal',
    'I need a forge studio system',
    'Build a custom ironwork platform',
    'Create a blacksmith class app',
  ],
};
