/**
 * Furniture Repair App Type Definition
 *
 * Complete definition for furniture repair and restoration operations.
 * Essential for furniture repair specialists, antique restorers, and upholstery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-repair',
  name: 'Furniture Repair',
  category: 'services',
  description: 'Furniture repair platform with intake management, repair tracking, before/after documentation, and pickup/delivery scheduling',
  icon: 'armchair',

  keywords: [
    'furniture repair',
    'furniture restoration',
    'furniture repair software',
    'antique restoration',
    'upholstery service',
    'furniture repair management',
    'intake management',
    'furniture repair practice',
    'furniture repair scheduling',
    'repair tracking',
    'furniture repair crm',
    'before after documentation',
    'furniture repair business',
    'pickup delivery',
    'furniture repair pos',
    'refinishing',
    'furniture repair operations',
    'leather repair',
    'furniture repair platform',
    'wood repair',
  ],

  synonyms: [
    'furniture repair platform',
    'furniture repair software',
    'furniture restoration software',
    'antique restoration software',
    'upholstery service software',
    'intake management software',
    'furniture repair practice software',
    'repair tracking software',
    'before after documentation software',
    'refinishing software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quotes and status' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Repairs and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'craftsman', name: 'Lead Craftsman', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/repairs' },
    { id: 'technician', name: 'Repair Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'gallery',
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
  industry: 'services',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'craftsman',

  examplePrompts: [
    'Build a furniture repair platform',
    'Create a furniture restoration app',
    'I need an upholstery service system',
    'Build a furniture repair shop app',
    'Create a furniture restoration portal',
  ],
};
