/**
 * Art Gallery App Type Definition
 *
 * Complete definition for art galleries and exhibition spaces.
 * Essential for art galleries, exhibition halls, and art dealers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_GALLERY_APP_TYPE: AppTypeDefinition = {
  id: 'art-gallery',
  name: 'Art Gallery',
  category: 'creative',
  description: 'Art gallery platform with exhibition management, artist portfolios, artwork sales, and visitor booking',
  icon: 'palette',

  keywords: [
    'art gallery',
    'exhibition space',
    'art gallery software',
    'fine art',
    'art dealer',
    'art gallery management',
    'exhibition management',
    'art gallery practice',
    'art gallery scheduling',
    'artwork sales',
    'art gallery crm',
    'art shows',
    'art gallery business',
    'artist representation',
    'art gallery pos',
    'art collection',
    'art gallery operations',
    'contemporary art',
    'art gallery services',
    'gallery opening',
  ],

  synonyms: [
    'art gallery platform',
    'art gallery software',
    'exhibition space software',
    'fine art software',
    'art dealer software',
    'exhibition management software',
    'art gallery practice software',
    'artwork sales software',
    'art shows software',
    'contemporary art software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Exhibitions and art' },
    { id: 'admin', name: 'Gallery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Artists and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Gallery Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/exhibitions' },
    { id: 'associate', name: 'Gallery Associate', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/artworks' },
    { id: 'visitor', name: 'Visitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'creative',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build an art gallery platform',
    'Create an exhibition space portal',
    'I need an art gallery management system',
    'Build a fine art dealer platform',
    'Create an artwork sales and exhibition app',
  ],
};
