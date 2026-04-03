/**
 * Packaging Manufacturing App Type Definition
 *
 * Complete definition for packaging manufacturing and converting applications.
 * Essential for packaging converters, box manufacturers, and label printers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PACKAGING_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'packaging-manufacturing',
  name: 'Packaging Manufacturing',
  category: 'manufacturing',
  description: 'Packaging manufacturing platform with job estimating, production scheduling, die management, and waste tracking',
  icon: 'box',

  keywords: [
    'packaging manufacturing',
    'packaging converter',
    'corrugated manufacturing',
    'box manufacturing',
    'label printing',
    'flexible packaging',
    'packaging software',
    'packaging erp',
    'die cutting',
    'folding carton',
    'packaging production',
    'converting software',
    'packaging estimating',
    'packaging scheduling',
    'print production',
    'packaging waste',
    'substrate tracking',
    'packaging jobs',
    'packaging quality',
    'packaging plant',
  ],

  synonyms: [
    'packaging manufacturing platform',
    'packaging manufacturing software',
    'packaging converter software',
    'corrugated manufacturing software',
    'box manufacturing software',
    'label printing software',
    'packaging erp software',
    'converting software',
    'packaging estimating software',
    'packaging production software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'product packaging'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and quotes' },
    { id: 'admin', name: 'Production Dashboard', enabled: true, basePath: '/admin', requiredRole: 'scheduler', layout: 'admin', description: 'Jobs and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'scheduler', name: 'Scheduler', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'estimator', name: 'Estimator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quotes' },
    { id: 'operator', name: 'Press Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a packaging manufacturing system',
    'Create a corrugated plant platform',
    'I need a packaging estimating app',
    'Build a label printing management system',
    'Create a packaging production scheduler',
  ],
};
