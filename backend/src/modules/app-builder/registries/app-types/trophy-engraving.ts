/**
 * Trophy & Engraving App Type Definition
 *
 * Complete definition for trophy and engraving shop operations.
 * Essential for trophy shops, award companies, and custom engraving services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TROPHY_ENGRAVING_APP_TYPE: AppTypeDefinition = {
  id: 'trophy-engraving',
  name: 'Trophy & Engraving',
  category: 'retail',
  description: 'Trophy and engraving platform with order management, artwork proofing, production tracking, and rush order handling',
  icon: 'trophy',

  keywords: [
    'trophy engraving',
    'award company',
    'trophy engraving software',
    'custom engraving',
    'recognition awards',
    'trophy engraving management',
    'order management',
    'trophy engraving practice',
    'trophy engraving scheduling',
    'artwork proofing',
    'trophy engraving crm',
    'production tracking',
    'trophy engraving business',
    'rush order',
    'trophy engraving pos',
    'plaques',
    'trophy engraving operations',
    'medals',
    'trophy engraving platform',
    'corporate awards',
  ],

  synonyms: [
    'trophy engraving platform',
    'trophy engraving software',
    'award company software',
    'custom engraving software',
    'recognition awards software',
    'order management software',
    'trophy engraving practice software',
    'artwork proofing software',
    'production tracking software',
    'plaques software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and orders' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Production Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/orders' },
    { id: 'engraver', name: 'Engraver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/queue' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'product-catalog',
    'clients',
    'shipping',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'gold',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a trophy and engraving platform',
    'Create an award company app',
    'I need a custom engraving system',
    'Build a trophy shop management app',
    'Create an engraving business portal',
  ],
};
