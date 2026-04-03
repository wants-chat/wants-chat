/**
 * E-Waste Recycling App Type Definition
 *
 * Complete definition for e-waste recycling operations.
 * Essential for electronics recyclers, IT asset disposition, and e-waste processors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EWASTE_RECYCLING_APP_TYPE: AppTypeDefinition = {
  id: 'ewaste-recycling',
  name: 'E-Waste Recycling',
  category: 'environmental',
  description: 'E-waste recycling platform with device intake, data destruction, chain of custody, and certification management',
  icon: 'cpu',

  keywords: [
    'ewaste recycling',
    'electronics recycling',
    'ewaste recycling software',
    'it asset disposition',
    'computer recycling',
    'ewaste recycling management',
    'device intake',
    'ewaste recycling practice',
    'ewaste recycling scheduling',
    'data destruction',
    'ewaste recycling crm',
    'chain of custody',
    'ewaste recycling business',
    'certification management',
    'ewaste recycling pos',
    'r2 certified',
    'ewaste recycling operations',
    'hard drive shredding',
    'ewaste recycling platform',
    'battery recycling',
  ],

  synonyms: [
    'ewaste recycling platform',
    'ewaste recycling software',
    'electronics recycling software',
    'it asset disposition software',
    'computer recycling software',
    'device intake software',
    'ewaste recycling practice software',
    'data destruction software',
    'chain of custody software',
    'r2 certified software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Drop-offs and tracking' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and processing' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/processing' },
    { id: 'technician', name: 'Processing Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/devices' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'team-management',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'tech',

  examplePrompts: [
    'Build an e-waste recycling platform',
    'Create an electronics recycling app',
    'I need an IT asset disposition system',
    'Build a computer recycling app',
    'Create an e-waste recycling portal',
  ],
};
