/**
 * Zip Line App Type Definition
 *
 * Complete definition for zip line and aerial adventure operations.
 * Essential for zip line tours, aerial parks, and adventure courses.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ZIP_LINE_APP_TYPE: AppTypeDefinition = {
  id: 'zip-line',
  name: 'Zip Line',
  category: 'outdoor',
  description: 'Zip line platform with tour booking, waiver management, weight requirements, and group packages',
  icon: 'wind',

  keywords: [
    'zip line',
    'aerial adventure',
    'zip line software',
    'canopy tour',
    'adventure course',
    'zip line management',
    'tour booking',
    'zip line practice',
    'zip line scheduling',
    'waiver management',
    'zip line crm',
    'weight requirements',
    'zip line business',
    'group packages',
    'zip line pos',
    'safety briefing',
    'zip line operations',
    'eco tours',
    'zip line platform',
    'aerial trekking',
  ],

  synonyms: [
    'zip line platform',
    'zip line software',
    'aerial adventure software',
    'canopy tour software',
    'adventure course software',
    'tour booking software',
    'zip line practice software',
    'waiver management software',
    'weight requirements software',
    'aerial trekking software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tours and booking' },
    { id: 'admin', name: 'Adventure Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tours and waivers' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tours' },
    { id: 'guide', name: 'Tour Guide', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'outdoor',

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a zip line tour platform',
    'Create an aerial adventure booking portal',
    'I need a canopy tour management system',
    'Build an adventure course platform',
    'Create a waiver and booking app',
  ],
};
