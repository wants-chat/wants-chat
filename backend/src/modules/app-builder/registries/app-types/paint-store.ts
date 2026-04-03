/**
 * Paint Store App Type Definition
 *
 * Complete definition for paint and coatings retail operations.
 * Essential for paint stores, coating suppliers, and home improvement paint centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAINT_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'paint-store',
  name: 'Paint Store',
  category: 'retail',
  description: 'Paint store platform with color matching, tinting orders, contractor accounts, and project calculators',
  icon: 'palette',

  keywords: [
    'paint store',
    'coating supplier',
    'paint store software',
    'paint retailer',
    'home improvement',
    'paint store management',
    'color matching',
    'paint store practice',
    'paint store scheduling',
    'tinting orders',
    'paint store crm',
    'contractor accounts',
    'paint store business',
    'project calculators',
    'paint store pos',
    'interior paint',
    'paint store operations',
    'exterior paint',
    'paint store platform',
    'stain finishes',
  ],

  synonyms: [
    'paint store platform',
    'paint store software',
    'coating supplier software',
    'paint retailer software',
    'home improvement software',
    'color matching software',
    'paint store practice software',
    'tinting orders software',
    'contractor accounts software',
    'stain finishes software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Colors and orders' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and accounts' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'associate', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tinting' },
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
    'clients',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a paint store platform',
    'Create a coating retailer portal',
    'I need a paint retail system',
    'Build a color matching platform',
    'Create a contractor account app',
  ],
};
