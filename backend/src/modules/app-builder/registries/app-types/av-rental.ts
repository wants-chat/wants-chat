/**
 * AV Rental App Type Definition
 *
 * Complete definition for audio visual equipment rental.
 * Essential for AV rental companies, event technology, and production services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AV_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'av-rental',
  name: 'AV Rental',
  category: 'rental',
  description: 'AV rental platform with equipment inventory, event scheduling, technician dispatch, and package builder',
  icon: 'speaker',

  keywords: [
    'av rental',
    'audio visual',
    'av rental software',
    'event technology',
    'production equipment',
    'av rental management',
    'equipment inventory',
    'av rental practice',
    'av rental scheduling',
    'event scheduling',
    'av rental crm',
    'sound systems',
    'av rental business',
    'video projection',
    'av rental pos',
    'lighting equipment',
    'av rental operations',
    'staging equipment',
    'av rental platform',
    'conference tech',
  ],

  synonyms: [
    'av rental platform',
    'av rental software',
    'audio visual software',
    'event technology software',
    'production equipment software',
    'equipment inventory software',
    'av rental practice software',
    'event scheduling software',
    'sound systems software',
    'conference tech software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'food'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Equipment and events' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'technician', name: 'AV Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
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
  complexity: 'complex',
  industry: 'rental',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an AV rental platform',
    'Create an audio visual rental portal',
    'I need an event technology management system',
    'Build a production equipment rental platform',
    'Create an equipment and technician scheduling app',
  ],
};
