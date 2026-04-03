/**
 * Cold Chain App Type Definition
 *
 * Complete definition for cold chain logistics and temperature-controlled shipping applications.
 * Essential for pharmaceutical, food, and temperature-sensitive goods logistics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COLD_CHAIN_APP_TYPE: AppTypeDefinition = {
  id: 'cold-chain',
  name: 'Cold Chain',
  category: 'logistics',
  description: 'Cold chain platform with temperature monitoring, compliance tracking, shipment management, and alerts',
  icon: 'thermometer',

  keywords: [
    'cold chain',
    'cold chain logistics',
    'temperature controlled',
    'refrigerated shipping',
    'cold storage',
    'temperature monitoring',
    'pharmaceutical logistics',
    'food cold chain',
    'frozen logistics',
    'temperature tracking',
    'cold chain management',
    'reefer tracking',
    'temperature compliance',
    'cold chain visibility',
    'perishable logistics',
    'vaccine logistics',
    'cold chain software',
    'temperature sensitive',
    'cold chain monitoring',
    'chilled distribution',
  ],

  synonyms: [
    'cold chain platform',
    'cold chain software',
    'temperature monitoring software',
    'cold chain logistics software',
    'refrigerated shipping software',
    'cold chain management platform',
    'temperature tracking software',
    'pharmaceutical cold chain software',
    'cold storage management',
    'perishable logistics software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'blockchain'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Track shipments and temperature' },
    { id: 'admin', name: 'Cold Chain Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Shipments and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shipments' },
    { id: 'compliance', name: 'Compliance Officer', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/compliance' },
    { id: 'operator', name: 'Warehouse Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/storage' },
    { id: 'driver', name: 'Driver', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'notifications',
    'search',
    'shipment-tracking',
    'warehouse-mgmt',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'fleet-tracking',
    'carrier-integration',
    'proof-of-delivery',
    'customs-docs',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a cold chain logistics platform',
    'Create a temperature monitoring system',
    'I need a refrigerated shipping tracker',
    'Build a pharmaceutical logistics app',
    'Create a cold chain compliance system',
  ],
};
