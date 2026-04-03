/**
 * Additive Manufacturing App Type Definition
 *
 * Complete definition for additive manufacturing and 3D printing applications.
 * Essential for 3D print shops, additive manufacturing, and rapid prototyping.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADDITIVE_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'additive-manufacturing',
  name: 'Additive Manufacturing',
  category: 'manufacturing',
  description: 'Additive manufacturing platform with print queue management, material tracking, quoting, and machine monitoring',
  icon: 'printer',

  keywords: [
    'additive manufacturing',
    '3d printing',
    '3d print shop',
    '3d printing service',
    'print farm',
    'rapid prototyping',
    'additive production',
    '3d print management',
    'print queue',
    'fdm printing',
    'sla printing',
    'sls printing',
    'metal 3d printing',
    '3d print software',
    'print farm management',
    'additive software',
    '3d printing business',
    'prototyping service',
    '3d print quoting',
    'print job management',
  ],

  synonyms: [
    'additive manufacturing platform',
    'additive manufacturing software',
    '3d printing software',
    '3d print shop software',
    'print farm software',
    'rapid prototyping software',
    '3d print management software',
    'print queue software',
    'additive production software',
    '3d printing service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'document printing'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Upload and order prints' },
    { id: 'admin', name: 'Print Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Queue and machines' },
  ],

  roles: [
    { id: 'admin', name: 'Print Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/queue' },
    { id: 'technician', name: 'Print Technician', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/machines' },
    { id: 'operator', name: 'Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'file-upload',
    'inventory',
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
  industry: 'manufacturing',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a 3D printing service platform',
    'Create a print farm management app',
    'I need an additive manufacturing system',
    'Build a 3D print shop with quoting',
    'Create a rapid prototyping platform',
  ],
};
