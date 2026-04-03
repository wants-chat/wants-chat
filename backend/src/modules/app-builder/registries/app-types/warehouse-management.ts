/**
 * Warehouse Management App Type Definition
 *
 * Complete definition for warehouse management system applications.
 * Essential for warehouses, distribution centers, and fulfillment operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WAREHOUSE_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'warehouse-management',
  name: 'Warehouse Management',
  category: 'logistics',
  description: 'Warehouse management platform with inventory control, pick/pack operations, receiving, and shipping integration',
  icon: 'warehouse',

  keywords: [
    'warehouse management',
    'wms',
    'warehouse system',
    'inventory management',
    'warehouse operations',
    'pick and pack',
    'warehouse software',
    'fulfillment center',
    'distribution center',
    'warehouse inventory',
    'bin management',
    'warehouse tracking',
    'receiving',
    'putaway',
    'warehouse automation',
    'order fulfillment',
    'warehouse logistics',
    'stock management',
    'warehouse control',
    'inventory control',
  ],

  synonyms: [
    'warehouse management platform',
    'warehouse management software',
    'wms software',
    'warehouse operations software',
    'inventory management software',
    'fulfillment software',
    'distribution center software',
    'warehouse control system',
    'warehouse tracking software',
    'warehouse logistics platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'personal storage'],

  sections: [
    { id: 'frontend', name: 'Worker Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pick lists and tasks' },
    { id: 'admin', name: 'Warehouse Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Inventory and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Warehouse Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Warehouse Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'supervisor', name: 'Floor Supervisor', level: 65, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'receiver', name: 'Receiving Clerk', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/receiving' },
    { id: 'picker', name: 'Picker/Packer', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'shipping',
    'notifications',
    'search',
    'warehouse-mgmt',
    'shipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'route-optimization',
    'carrier-integration',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a warehouse management system',
    'Create a WMS platform',
    'I need a fulfillment center app',
    'Build an inventory control system',
    'Create a pick and pack solution',
  ],
};
