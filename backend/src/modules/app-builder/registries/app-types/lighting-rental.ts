/**
 * Lighting Rental App Type Definition
 *
 * Complete definition for event lighting rental operations.
 * Essential for lighting companies, event production, and stage lighting services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIGHTING_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'lighting-rental',
  name: 'Lighting Rental',
  category: 'rental',
  description: 'Lighting rental platform with equipment inventory, design consultation, installation scheduling, and package bundling',
  icon: 'lightbulb',

  keywords: [
    'lighting rental',
    'event lighting',
    'lighting rental software',
    'stage lighting',
    'event production',
    'lighting rental management',
    'equipment inventory',
    'lighting rental practice',
    'lighting rental scheduling',
    'design consultation',
    'lighting rental crm',
    'installation scheduling',
    'lighting rental business',
    'package bundling',
    'lighting rental pos',
    'uplighting',
    'lighting rental operations',
    'string lights',
    'lighting rental platform',
    'dmx lighting',
  ],

  synonyms: [
    'lighting rental platform',
    'lighting rental software',
    'event lighting software',
    'stage lighting software',
    'event production software',
    'equipment inventory software',
    'lighting rental practice software',
    'design consultation software',
    'installation scheduling software',
    'dmx lighting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rentals and designs' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Lighting Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'technician', name: 'Install Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a lighting rental platform',
    'Create an event lighting portal',
    'I need a lighting rental management system',
    'Build an equipment inventory platform',
    'Create a design and installation app',
  ],
};
