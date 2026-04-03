/**
 * VR Arcade App Type Definition
 *
 * Complete definition for virtual reality entertainment operations.
 * Essential for VR arcades, immersive experience centers, and gaming lounges.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VR_ARCADE_APP_TYPE: AppTypeDefinition = {
  id: 'vr-arcade',
  name: 'VR Arcade',
  category: 'entertainment',
  description: 'VR arcade platform with station booking, experience catalog, session management, and equipment tracking',
  icon: 'glasses',

  keywords: [
    'vr arcade',
    'virtual reality',
    'vr arcade software',
    'immersive gaming',
    'gaming lounge',
    'vr arcade management',
    'station booking',
    'vr arcade practice',
    'vr arcade scheduling',
    'experience catalog',
    'vr arcade crm',
    'session management',
    'vr arcade business',
    'equipment tracking',
    'vr arcade pos',
    'escape vr',
    'vr arcade operations',
    'multiplayer vr',
    'vr arcade platform',
    'motion platforms',
  ],

  synonyms: [
    'vr arcade platform',
    'vr arcade software',
    'virtual reality software',
    'immersive gaming software',
    'gaming lounge software',
    'station booking software',
    'vr arcade practice software',
    'experience catalog software',
    'session management software',
    'escape vr software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Experiences and booking' },
    { id: 'admin', name: 'Arcade Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Stations and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Arcade Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Floor Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/stations' },
    { id: 'staff', name: 'VR Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'customer', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'season-passes',
    'venue-booking',
    'backstage-access',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'futuristic',

  examplePrompts: [
    'Build a VR arcade platform',
    'Create a virtual reality center portal',
    'I need an immersive gaming system',
    'Build a VR station booking platform',
    'Create a VR experience app',
  ],
};
