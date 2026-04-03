/**
 * Moving Company App Type Definition
 *
 * Complete definition for moving and relocation service applications.
 * Essential for moving companies, movers, and relocation services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOVING_APP_TYPE: AppTypeDefinition = {
  id: 'moving',
  name: 'Moving Company',
  category: 'services',
  description: 'Moving service platform with quote requests, booking, inventory tracking, and crew management',
  icon: 'truck-moving',

  keywords: [
    'moving',
    'moving company',
    'movers',
    'relocation',
    'moving service',
    'moving truck',
    'packing',
    'uhaul',
    'pods',
    'two men and a truck',
    'moving labor',
    'furniture moving',
    'local moving',
    'long distance moving',
    'commercial moving',
    'office relocation',
    'piano moving',
    'junk removal',
    'storage moving',
    'moving estimate',
    'moving quote',
    'moving supplies',
  ],

  synonyms: [
    'moving platform',
    'moving software',
    'mover booking',
    'relocation software',
    'moving company app',
    'moving service app',
    'mover app',
    'moving management',
    'relocation platform',
    'moving booking system',
  ],

  negativeKeywords: ['blog', 'portfolio', 'ecommerce', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quote requests and booking' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Move scheduling and crew management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'crew', name: 'Moving Crew', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'messaging',
    'notifications',
    'search',
    'route-optimization',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'contracts',
    'reviews',
    'invoicing',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a moving company booking platform',
    'Create a movers marketplace app',
    'I need a moving service management system',
    'Build a relocation services app with quotes',
    'Create a moving company app like Two Men and a Truck',
  ],
};
