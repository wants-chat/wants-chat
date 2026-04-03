/**
 * Furniture Store App Type Definition
 *
 * Complete definition for furniture retail operations.
 * Essential for furniture stores, home furnishing retailers, and interior design shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-store',
  name: 'Furniture Store',
  category: 'retail',
  description: 'Furniture store platform with room planning, delivery coordination, special orders, and financing programs',
  icon: 'sofa',

  keywords: [
    'furniture store',
    'home furnishing',
    'furniture store software',
    'interior design',
    'home decor',
    'furniture store management',
    'room planning',
    'furniture store practice',
    'furniture store scheduling',
    'delivery coordination',
    'furniture store crm',
    'special orders',
    'furniture store business',
    'financing programs',
    'furniture store pos',
    'living room',
    'furniture store operations',
    'bedroom furniture',
    'furniture store platform',
    'office furniture',
  ],

  synonyms: [
    'furniture store platform',
    'furniture store software',
    'home furnishing software',
    'interior design software',
    'home decor software',
    'room planning software',
    'furniture store practice software',
    'delivery coordination software',
    'special orders software',
    'office furniture software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and design' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Design Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/clients' },
    { id: 'sales', name: 'Sales Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
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
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a furniture store platform',
    'Create a home furnishing portal',
    'I need a furniture retail system',
    'Build a room planning platform',
    'Create a furniture delivery app',
  ],
};
