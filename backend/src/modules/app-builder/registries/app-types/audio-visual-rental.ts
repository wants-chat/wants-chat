/**
 * Audio Visual Rental App Type Definition
 *
 * Complete definition for AV rental operations.
 * Essential for AV companies, event production, and tech rental services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUDIO_VISUAL_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'audio-visual-rental',
  name: 'Audio Visual Rental',
  category: 'rental',
  description: 'AV rental platform with equipment inventory, technical consultation, setup services, and package configuration',
  icon: 'speaker',

  keywords: [
    'audio visual rental',
    'av rental',
    'audio visual rental software',
    'event production',
    'tech rental',
    'audio visual rental management',
    'equipment inventory',
    'audio visual rental practice',
    'audio visual rental scheduling',
    'technical consultation',
    'audio visual rental crm',
    'setup services',
    'audio visual rental business',
    'package configuration',
    'audio visual rental pos',
    'sound systems',
    'audio visual rental operations',
    'projection',
    'audio visual rental platform',
    'video walls',
  ],

  synonyms: [
    'audio visual rental platform',
    'audio visual rental software',
    'av rental software',
    'event production software',
    'tech rental software',
    'equipment inventory software',
    'audio visual rental practice software',
    'technical consultation software',
    'setup services software',
    'video walls software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Rentals and quotes' },
    { id: 'admin', name: 'Rental Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and setup' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'engineer', name: 'AV Engineer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'AV Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an AV rental platform',
    'Create an audio visual rental portal',
    'I need an AV rental management system',
    'Build an equipment inventory platform',
    'Create a technical consultation and setup app',
  ],
};
