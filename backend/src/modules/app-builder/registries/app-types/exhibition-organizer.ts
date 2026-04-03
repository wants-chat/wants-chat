/**
 * Exhibition Organizer App Type Definition
 *
 * Complete definition for art and cultural exhibition organization.
 * Essential for gallery curators, museum event planners, and exhibition managers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXHIBITION_ORGANIZER_APP_TYPE: AppTypeDefinition = {
  id: 'exhibition-organizer',
  name: 'Exhibition Organizer',
  category: 'events',
  description: 'Exhibition organizing platform with artwork cataloging, gallery layout planning, artist coordination, and visitor management',
  icon: 'image',

  keywords: [
    'exhibition organizer',
    'art exhibition',
    'exhibition organizer software',
    'gallery events',
    'museum exhibitions',
    'exhibition organizer management',
    'artwork cataloging',
    'exhibition organizer practice',
    'exhibition organizer scheduling',
    'gallery layout',
    'exhibition organizer crm',
    'artist coordination',
    'exhibition organizer business',
    'visitor management',
    'exhibition organizer pos',
    'opening reception',
    'exhibition organizer operations',
    'cultural events',
    'exhibition organizer services',
    'curatorial management',
  ],

  synonyms: [
    'exhibition organizer platform',
    'exhibition organizer software',
    'art exhibition software',
    'gallery events software',
    'museum exhibitions software',
    'artwork cataloging software',
    'exhibition organizer practice software',
    'gallery layout software',
    'visitor management software',
    'curatorial management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Visitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Exhibitions and tickets' },
    { id: 'admin', name: 'Exhibition Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Exhibitions and artists' },
  ],

  roles: [
    { id: 'admin', name: 'Exhibition Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/exhibitions' },
    { id: 'coordinator', name: 'Gallery Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/artworks' },
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
  industry: 'arts',

  defaultColorScheme: 'neutral',
  defaultDesignVariant: 'gallery',

  examplePrompts: [
    'Build an exhibition organizing platform',
    'Create an art gallery event portal',
    'I need a museum exhibition management system',
    'Build an exhibition organizer platform',
    'Create an artwork and artist coordination app',
  ],
};
