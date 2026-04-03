/**
 * Customs Brokerage App Type Definition
 *
 * Complete definition for customs brokerage and trade compliance applications.
 * Essential for customs brokers, importers, exporters, and trade compliance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOMS_BROKERAGE_APP_TYPE: AppTypeDefinition = {
  id: 'customs-brokerage',
  name: 'Customs Brokerage',
  category: 'logistics',
  description: 'Customs brokerage platform with clearance management, document processing, tariff classification, and compliance tracking',
  icon: 'globe',

  keywords: [
    'customs brokerage',
    'customs broker',
    'customs clearance',
    'import export',
    'trade compliance',
    'customs software',
    'tariff classification',
    'duty calculation',
    'customs documentation',
    'import clearance',
    'export clearance',
    'customs entry',
    'hs code',
    'customs duty',
    'trade facilitation',
    'customs declaration',
    'bonded warehouse',
    'ftz',
    'customs compliance',
    'international trade',
  ],

  synonyms: [
    'customs brokerage platform',
    'customs brokerage software',
    'customs clearance software',
    'trade compliance software',
    'customs broker software',
    'import export software',
    'customs management platform',
    'tariff classification software',
    'customs documentation software',
    'trade facilitation platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'wedding customs'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Track clearances and documents' },
    { id: 'admin', name: 'Brokerage Dashboard', enabled: true, basePath: '/admin', requiredRole: 'broker', layout: 'admin', description: 'Entries and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Brokerage Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/entries' },
    { id: 'broker', name: 'Licensed Broker', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clearances' },
    { id: 'specialist', name: 'Entry Specialist', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/documents' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'customs-docs',
    'shipment-tracking',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'carrier-integration',
    'freight-quotes',
    'warehouse-mgmt',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a customs brokerage platform',
    'Create a customs clearance system',
    'I need a trade compliance app',
    'Build an import/export management platform',
    'Create a customs documentation system',
  ],
};
