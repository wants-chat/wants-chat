/**
 * Stained Glass App Type Definition
 *
 * Complete definition for stained glass and glass art operations.
 * Essential for stained glass studios, glass artists, and restoration specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STAINED_GLASS_APP_TYPE: AppTypeDefinition = {
  id: 'stained-glass',
  name: 'Stained Glass',
  category: 'artisan',
  description: 'Stained glass studio platform with commission management, restoration tracking, class scheduling, and pattern library',
  icon: 'square',

  keywords: [
    'stained glass',
    'glass artist',
    'stained glass software',
    'restoration',
    'leaded glass',
    'stained glass management',
    'commission management',
    'stained glass practice',
    'stained glass scheduling',
    'restoration tracking',
    'stained glass crm',
    'class scheduling',
    'stained glass business',
    'pattern library',
    'stained glass pos',
    'church windows',
    'stained glass operations',
    'mosaic glass',
    'stained glass platform',
    'copper foil',
  ],

  synonyms: [
    'stained glass platform',
    'stained glass software',
    'glass artist software',
    'restoration software',
    'leaded glass software',
    'commission management software',
    'stained glass practice software',
    'restoration tracking software',
    'class scheduling software',
    'church windows software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Gallery and classes' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and patterns' },
  ],

  roles: [
    { id: 'admin', name: 'Master Glazier', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'artist', name: 'Glass Artist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'staff', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'artistic',

  examplePrompts: [
    'Build a stained glass platform',
    'Create a glass artist portal',
    'I need a stained glass studio system',
    'Build a glass restoration platform',
    'Create a stained glass class app',
  ],
};
