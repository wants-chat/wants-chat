/**
 * Environmental Lab App Type Definition
 *
 * Complete definition for environmental testing laboratory operations.
 * Essential for environmental labs, water testing facilities, and air quality monitors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ENVIRONMENTAL_LAB_APP_TYPE: AppTypeDefinition = {
  id: 'environmental-lab',
  name: 'Environmental Lab',
  category: 'science-research',
  description: 'Environmental lab platform with sample collection, EPA compliance, result analysis, and regulatory reporting',
  icon: 'leaf',

  keywords: [
    'environmental lab',
    'environmental testing',
    'environmental lab software',
    'water testing',
    'air quality',
    'environmental lab management',
    'sample collection',
    'environmental lab practice',
    'environmental lab scheduling',
    'epa compliance',
    'environmental lab crm',
    'result analysis',
    'environmental lab business',
    'regulatory reporting',
    'environmental lab pos',
    'soil testing',
    'environmental lab operations',
    'contamination testing',
    'environmental lab platform',
    'nelac certification',
  ],

  synonyms: [
    'environmental lab platform',
    'environmental lab software',
    'environmental testing software',
    'water testing software',
    'air quality software',
    'sample collection software',
    'environmental lab practice software',
    'epa compliance software',
    'result analysis software',
    'soil testing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Results and compliance' },
    { id: 'admin', name: 'Lab Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Samples and analysis' },
  ],

  roles: [
    { id: 'admin', name: 'Lab Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'chemist', name: 'Environmental Chemist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/analysis' },
    { id: 'technician', name: 'Lab Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/samples' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'science-research',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an environmental lab platform',
    'Create a water testing portal',
    'I need an environmental testing system',
    'Build an EPA compliance platform',
    'Create a sample and analysis tracking app',
  ],
};
