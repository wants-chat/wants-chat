/**
 * Record Store App Type Definition
 *
 * Complete definition for record store operations.
 * Essential for vinyl shops, music stores, and record dealers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECORD_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'record-store',
  name: 'Record Store',
  category: 'retail',
  description: 'Record store platform with vinyl inventory, grading system, want lists, and in-store events',
  icon: 'disc',

  keywords: [
    'record store',
    'vinyl shop',
    'record store software',
    'music store',
    'record dealer',
    'record store management',
    'vinyl inventory',
    'record store practice',
    'record store scheduling',
    'grading system',
    'record store crm',
    'want lists',
    'record store business',
    'in-store events',
    'record store pos',
    'rare vinyl',
    'record store operations',
    'listening stations',
    'record store platform',
    'discogs integration',
  ],

  synonyms: [
    'record store platform',
    'record store software',
    'vinyl shop software',
    'music store software',
    'record dealer software',
    'vinyl inventory software',
    'record store practice software',
    'grading system software',
    'want lists software',
    'discogs integration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Records and events' },
    { id: 'admin', name: 'Store Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Store Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Store Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Sales Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sales' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'retro',

  examplePrompts: [
    'Build a record store platform',
    'Create a vinyl shop inventory portal',
    'I need a music store management system',
    'Build a vinyl grading and sales platform',
    'Create a want list and events app',
  ],
};
