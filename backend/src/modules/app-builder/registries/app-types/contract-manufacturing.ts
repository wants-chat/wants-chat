/**
 * Contract Manufacturing App Type Definition
 *
 * Complete definition for contract manufacturing and CMO applications.
 * Essential for contract manufacturers, OEM suppliers, and private label production.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONTRACT_MANUFACTURING_APP_TYPE: AppTypeDefinition = {
  id: 'contract-manufacturing',
  name: 'Contract Manufacturing',
  category: 'manufacturing',
  description: 'Contract manufacturing platform with customer portals, quote management, production tracking, and capacity planning',
  icon: 'handshake',

  keywords: [
    'contract manufacturing',
    'contract manufacturer',
    'cmo',
    'oem manufacturing',
    'private label',
    'toll manufacturing',
    'outsourced manufacturing',
    'manufacturing services',
    'contract production',
    'manufacturing partner',
    'subcontract manufacturing',
    'custom manufacturing',
    'manufacturing quotes',
    'contract work',
    'manufacturing capacity',
    'customer production',
    'manufacturing software',
    'cm software',
    'manufacturing portal',
    'production outsourcing',
  ],

  synonyms: [
    'contract manufacturing platform',
    'contract manufacturing software',
    'cmo software',
    'oem manufacturing software',
    'private label software',
    'toll manufacturing software',
    'contract production software',
    'manufacturing services software',
    'subcontract manufacturing software',
    'custom manufacturing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'contract law'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Orders and tracking' },
    { id: 'admin', name: 'CM Dashboard', enabled: true, basePath: '/admin', requiredRole: 'account', layout: 'admin', description: 'Customers and production' },
  ],

  roles: [
    { id: 'admin', name: 'CM Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'account', name: 'Account Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/customers' },
    { id: 'planner', name: 'Production Planner', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/planning' },
    { id: 'supervisor', name: 'Production Supervisor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/floor' },
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
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'manufacturing',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a contract manufacturing platform',
    'Create a CMO management system',
    'I need a private label production app',
    'Build an OEM supplier portal',
    'Create a contract manufacturing portal',
  ],
};
