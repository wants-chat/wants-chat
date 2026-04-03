/**
 * Hiking Trails App Type Definition
 *
 * Complete definition for hiking trails and outdoor recreation.
 * Essential for trail systems, parks, and outdoor recreation areas.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HIKING_TRAILS_APP_TYPE: AppTypeDefinition = {
  id: 'hiking-trails',
  name: 'Hiking Trails',
  category: 'outdoor',
  description: 'Hiking trails platform with trail maps, condition reports, permit management, and guided hikes',
  icon: 'mountain',

  keywords: [
    'hiking trails',
    'trail system',
    'hiking trails software',
    'outdoor recreation',
    'park trails',
    'hiking trails management',
    'trail maps',
    'hiking trails practice',
    'hiking trails scheduling',
    'condition reports',
    'hiking trails crm',
    'permit management',
    'hiking trails business',
    'guided hikes',
    'hiking trails pos',
    'difficulty ratings',
    'hiking trails operations',
    'trailhead info',
    'hiking trails platform',
    'nature walks',
  ],

  synonyms: [
    'hiking trails platform',
    'hiking trails software',
    'trail system software',
    'outdoor recreation software',
    'park trails software',
    'trail maps software',
    'hiking trails practice software',
    'condition reports software',
    'permit management software',
    'nature walks software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Hiker Portal', enabled: true, basePath: '/', layout: 'public', description: 'Trails and conditions' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Trails and permits' },
  ],

  roles: [
    { id: 'admin', name: 'Park Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'ranger', name: 'Park Ranger', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/conditions' },
    { id: 'guide', name: 'Trail Guide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/hikes' },
    { id: 'hiker', name: 'Hiker', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'outdoor',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'outdoor',

  examplePrompts: [
    'Build a hiking trails management platform',
    'Create a trail conditions portal',
    'I need a hiking permit system',
    'Build a guided hikes booking platform',
    'Create a trail map and conditions app',
  ],
};
