/**
 * Food Processing App Type Definition
 *
 * Complete definition for food processing and food production applications.
 * Essential for food manufacturers, processing plants, and food production.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FOOD_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'food-processing',
  name: 'Food Processing',
  category: 'manufacturing',
  description: 'Food processing platform with batch tracking, recipe management, HACCP compliance, and production scheduling',
  icon: 'utensils-crossed',

  keywords: [
    'food processing',
    'food manufacturing',
    'food production',
    'food plant',
    'food software',
    'batch tracking',
    'recipe management',
    'haccp',
    'food safety',
    'food traceability',
    'ingredient tracking',
    'food erp',
    'food compliance',
    'production batches',
    'food quality',
    'allergen management',
    'lot tracking',
    'food recall',
    'food packaging',
    'food operations',
  ],

  synonyms: [
    'food processing platform',
    'food processing software',
    'food manufacturing software',
    'food production software',
    'food plant software',
    'batch tracking software',
    'recipe management software',
    'food safety software',
    'food traceability software',
    'food erp software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Operations Portal', enabled: true, basePath: '/', layout: 'public', description: 'Production status' },
    { id: 'admin', name: 'Processing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'supervisor', layout: 'admin', description: 'Batches and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'quality', name: 'QA Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quality' },
    { id: 'supervisor', name: 'Line Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/batches' },
    { id: 'operator', name: 'Production Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a food processing system',
    'Create a food manufacturing platform',
    'I need a batch tracking app',
    'Build a HACCP compliance system',
    'Create a food production ERP',
  ],
};
