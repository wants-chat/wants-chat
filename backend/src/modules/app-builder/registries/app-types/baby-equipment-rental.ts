/**
 * Baby Equipment Rental App Type Definition
 *
 * Complete definition for baby equipment rental service operations.
 * Essential for baby gear rental companies, vacation baby supplies, and temporary infant equipment services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BABY_EQUIPMENT_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'baby-equipment-rental',
  name: 'Baby Equipment Rental',
  category: 'retail',
  description: 'Baby equipment rental platform with inventory management, delivery scheduling, cleaning protocols, and reservation system',
  icon: 'baby-carriage',

  keywords: [
    'baby equipment rental',
    'baby gear rental',
    'baby equipment rental software',
    'vacation baby supplies',
    'infant equipment',
    'baby equipment rental management',
    'inventory management',
    'baby equipment rental practice',
    'baby equipment rental scheduling',
    'delivery scheduling',
    'baby equipment rental crm',
    'cleaning protocols',
    'baby equipment rental business',
    'reservation system',
    'baby equipment rental pos',
    'crib rental',
    'baby equipment rental operations',
    'stroller rental',
    'baby equipment rental platform',
    'car seat rental',
  ],

  synonyms: [
    'baby equipment rental platform',
    'baby equipment rental software',
    'baby gear rental software',
    'vacation baby supplies software',
    'infant equipment software',
    'inventory management software',
    'baby equipment rental practice software',
    'delivery scheduling software',
    'cleaning protocols software',
    'crib rental software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and reservations' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and deliveries' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'staff', name: 'Delivery Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/deliveries' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a baby equipment rental platform',
    'Create a baby gear rental app',
    'I need a vacation baby supplies system',
    'Build an infant equipment rental app',
    'Create a baby equipment rental portal',
  ],
};
