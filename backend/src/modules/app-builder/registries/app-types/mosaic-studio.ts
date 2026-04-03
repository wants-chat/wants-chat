/**
 * Mosaic Studio App Type Definition
 *
 * Complete definition for mosaic and tile arts operations.
 * Essential for mosaic studios, tile artists, and architectural mosaic specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOSAIC_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'mosaic-studio',
  name: 'Mosaic Studio',
  category: 'artisan',
  description: 'Mosaic studio platform with commission management, class scheduling, installation services, and material sourcing',
  icon: 'layout-grid',

  keywords: [
    'mosaic studio',
    'tile artist',
    'mosaic studio software',
    'architectural mosaic',
    'tesserae',
    'mosaic studio management',
    'commission management',
    'mosaic studio practice',
    'mosaic studio scheduling',
    'class scheduling',
    'mosaic studio crm',
    'installation services',
    'mosaic studio business',
    'material sourcing',
    'mosaic studio pos',
    'murals',
    'mosaic studio operations',
    'pool mosaics',
    'mosaic studio platform',
    'restoration',
  ],

  synonyms: [
    'mosaic studio platform',
    'mosaic studio software',
    'tile artist software',
    'architectural mosaic software',
    'tesserae software',
    'commission management software',
    'mosaic studio practice software',
    'class scheduling software',
    'installation services software',
    'murals software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Gallery and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Master Mosaicist', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Mosaic Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/installs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
  industry: 'artisan',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'artistic',

  examplePrompts: [
    'Build a mosaic studio platform',
    'Create a tile arts portal',
    'I need a mosaic commission system',
    'Build a mosaic class platform',
    'Create a mosaic installation app',
  ],
};
