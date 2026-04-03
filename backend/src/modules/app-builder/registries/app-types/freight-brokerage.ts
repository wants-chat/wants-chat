/**
 * Freight Brokerage App Type Definition
 *
 * Complete definition for freight brokerage and load board applications.
 * Essential for freight brokers, load matching, and trucking logistics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FREIGHT_BROKERAGE_APP_TYPE: AppTypeDefinition = {
  id: 'freight-brokerage',
  name: 'Freight Brokerage',
  category: 'logistics',
  description: 'Freight brokerage platform with load board, carrier matching, rate negotiation, and shipment tracking',
  icon: 'scale',

  keywords: [
    'freight brokerage',
    'freight broker',
    'load board',
    'freight matching',
    'carrier matching',
    'trucking logistics',
    'freight marketplace',
    'load matching',
    'freight software',
    'broker software',
    'tms',
    'transportation management',
    'freight rates',
    'carrier network',
    'shipper broker',
    'freight quotes',
    'ltl freight',
    'ftl freight',
    'freight dispatch',
    'load posting',
  ],

  synonyms: [
    'freight brokerage platform',
    'freight broker software',
    'load board software',
    'freight matching platform',
    'carrier matching software',
    'transportation management software',
    'freight marketplace platform',
    'load matching software',
    'freight broker tms',
    'trucking broker software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'personal shipping'],

  sections: [
    { id: 'frontend', name: 'Load Board', enabled: true, basePath: '/', layout: 'public', description: 'Browse and book loads' },
    { id: 'admin', name: 'Brokerage Dashboard', enabled: true, basePath: '/admin', requiredRole: 'broker', layout: 'admin', description: 'Loads and carriers' },
  ],

  roles: [
    { id: 'admin', name: 'Brokerage Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/loads' },
    { id: 'broker', name: 'Freight Broker', level: 65, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/matching' },
    { id: 'carrier', name: 'Carrier', level: 40, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/loads' },
    { id: 'shipper', name: 'Shipper', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'documents',
    'notifications',
    'search',
    'freight-quotes',
    'carrier-integration',
    'shipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'route-optimization',
    'fleet-tracking',
    'proof-of-delivery',
    'customs-docs',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a freight brokerage platform',
    'Create a load board app',
    'I need a freight broker software',
    'Build a carrier matching system',
    'Create a trucking logistics platform',
  ],
};
