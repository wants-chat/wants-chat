/**
 * Hair Extensions App Type Definition
 *
 * Complete definition for hair extensions and hair replacement applications.
 * Essential for extension studios, hair replacement centers, and wig specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_EXTENSIONS_APP_TYPE: AppTypeDefinition = {
  id: 'hair-extensions',
  name: 'Hair Extensions',
  category: 'beauty',
  description: 'Hair extensions platform with consultation booking, extension tracking, maintenance scheduling, and inventory management',
  icon: 'sparkles',

  keywords: [
    'hair extensions',
    'hair extension salon',
    'extensions software',
    'tape-in extensions',
    'sew-in extensions',
    'extension booking',
    'hair replacement',
    'wig salon',
    'extension maintenance',
    'extension studio',
    'hair extension business',
    'extension scheduling',
    'fusion extensions',
    'clip-in extensions',
    'extension inventory',
    'extension crm',
    'hair loss solutions',
    'extension specialist',
    'extension appointments',
    'extension management',
  ],

  synonyms: [
    'hair extensions platform',
    'hair extensions software',
    'extension salon software',
    'hair replacement software',
    'extension booking software',
    'extension scheduling software',
    'wig salon software',
    'extension studio software',
    'extension management software',
    'hair extension business software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'browser extensions'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and consultations' },
    { id: 'admin', name: 'Extension Dashboard', enabled: true, basePath: '/admin', requiredRole: 'stylist', layout: 'admin', description: 'Clients and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Salon Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'stylist', name: 'Extension Specialist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a hair extensions booking platform',
    'Create a hair replacement studio app',
    'I need an extension maintenance scheduling system',
    'Build a wig salon management app',
    'Create a hair extensions business platform',
  ],
};
