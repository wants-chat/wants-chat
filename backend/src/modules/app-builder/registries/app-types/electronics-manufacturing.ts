/**
 * Electronics Manufacturing App Type Definition
 *
 * Complete definition for electronics manufacturing and PCB assembly applications.
 * Essential for EMS providers, PCB assembly, and electronics production.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRONICS_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'electronics-manufacturing',
  name: 'Electronics Manufacturing',
  category: 'manufacturing',
  description: 'Electronics manufacturing platform with SMT tracking, PCB assembly management, test data, and traceability',
  icon: 'cpu',

  keywords: [
    'electronics manufacturing',
    'ems',
    'pcb assembly',
    'smt manufacturing',
    'electronics production',
    'pcba',
    'electronics factory',
    'circuit board assembly',
    'electronics software',
    'smt line',
    'pick and place',
    'reflow soldering',
    'wave soldering',
    'electronics testing',
    'aoi inspection',
    'electronics traceability',
    'component tracking',
    'electronics erp',
    'contract electronics',
    'ems software',
  ],

  synonyms: [
    'electronics manufacturing platform',
    'electronics manufacturing software',
    'ems software',
    'pcb assembly software',
    'smt manufacturing software',
    'electronics production software',
    'electronics factory software',
    'pcba software',
    'electronics traceability software',
    'electronics erp software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'electronics store'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Order tracking' },
    { id: 'admin', name: 'Production Dashboard', enabled: true, basePath: '/admin', requiredRole: 'engineer', layout: 'admin', description: 'Production and quality' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'engineer', name: 'Process Engineer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/processes' },
    { id: 'quality', name: 'Quality Engineer', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/quality' },
    { id: 'operator', name: 'Line Operator', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/line' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
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

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an electronics manufacturing system',
    'Create a PCB assembly platform',
    'I need an EMS production app',
    'Build an SMT tracking system',
    'Create an electronics traceability platform',
  ],
};
