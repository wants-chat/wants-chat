/**
 * Manufacturing ERP App Type Definition
 *
 * Complete definition for manufacturing ERP and production management applications.
 * Essential for manufacturing operations, production planning, and shop floor management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MANUFACTURING_ERP_APP_TYPE: AppTypeDefinition = {
  id: 'manufacturing-erp',
  name: 'Manufacturing ERP',
  category: 'manufacturing',
  description: 'Manufacturing ERP platform with production planning, inventory control, shop floor management, and quality tracking',
  icon: 'factory',

  keywords: [
    'manufacturing erp',
    'production management',
    'manufacturing software',
    'mrp system',
    'shop floor',
    'production planning',
    'manufacturing operations',
    'bill of materials',
    'bom management',
    'work orders',
    'manufacturing execution',
    'mes',
    'production control',
    'manufacturing inventory',
    'capacity planning',
    'production scheduling',
    'shop floor control',
    'manufacturing tracking',
    'discrete manufacturing',
    'process manufacturing',
  ],

  synonyms: [
    'manufacturing erp platform',
    'manufacturing erp software',
    'production management software',
    'mrp software',
    'manufacturing execution software',
    'shop floor software',
    'production planning software',
    'manufacturing operations software',
    'bom management software',
    'manufacturing control software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general erp'],

  sections: [
    { id: 'frontend', name: 'Shop Floor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Production status' },
    { id: 'admin', name: 'Manufacturing Dashboard', enabled: true, basePath: '/admin', requiredRole: 'planner', layout: 'admin', description: 'Planning and production' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'planner', name: 'Production Planner', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/planning' },
    { id: 'supervisor', name: 'Shop Supervisor', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/workorders' },
    { id: 'operator', name: 'Machine Operator', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'shipping',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a manufacturing ERP system',
    'Create a production management platform',
    'I need a shop floor management app',
    'Build a manufacturing operations system',
    'Create an MRP software',
  ],
};
