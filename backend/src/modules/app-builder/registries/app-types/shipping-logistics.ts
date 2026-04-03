/**
 * Shipping Logistics App Type Definition
 *
 * Complete definition for shipping and logistics management applications.
 * Essential for shipping companies, freight forwarders, and logistics providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIPPING_LOGISTICS_APP_TYPE: AppTypeDefinition = {
  id: 'shipping-logistics',
  name: 'Shipping Logistics',
  category: 'logistics',
  description: 'Shipping logistics platform with shipment tracking, rate management, carrier integration, and documentation',
  icon: 'package',

  keywords: [
    'shipping logistics',
    'freight shipping',
    'shipment tracking',
    'logistics management',
    'freight forwarding',
    'shipping management',
    'cargo tracking',
    'shipping rates',
    'logistics platform',
    'shipping software',
    'freight management',
    'shipping carrier',
    'parcel tracking',
    'shipping labels',
    'international shipping',
    'domestic shipping',
    'shipping quotes',
    'freight rates',
    'logistics operations',
    'supply chain shipping',
  ],

  synonyms: [
    'shipping logistics platform',
    'shipping management software',
    'freight logistics software',
    'logistics management platform',
    'shipment tracking software',
    'freight forwarding software',
    'shipping operations software',
    'cargo management platform',
    'logistics tracking software',
    'shipping automation platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'dropshipping store'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Track shipments and get quotes' },
    { id: 'admin', name: 'Logistics Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Shipments and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shipments' },
    { id: 'coordinator', name: 'Logistics Coordinator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tracking' },
    { id: 'agent', name: 'Customer Agent', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'notifications',
    'search',
    'shipment-tracking',
    'carrier-integration',
    'freight-quotes',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'warehouse-mgmt',
    'proof-of-delivery',
    'customs-docs',
    'fleet-tracking',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a shipping logistics platform',
    'Create a freight management system',
    'I need a shipment tracking app',
    'Build a logistics operations platform',
    'Create a shipping rate calculator',
  ],
};
