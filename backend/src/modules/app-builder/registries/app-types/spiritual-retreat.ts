/**
 * Spiritual Retreat App Type Definition
 *
 * Complete definition for spiritual retreat center operations.
 * Essential for retreat centers, ashrams, and spiritual wellness facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPIRITUAL_RETREAT_APP_TYPE: AppTypeDefinition = {
  id: 'spiritual-retreat',
  name: 'Spiritual Retreat',
  category: 'religious-spiritual',
  description: 'Spiritual retreat platform with program scheduling, accommodation booking, practitioner management, and participant registration',
  icon: 'sun',

  keywords: [
    'spiritual retreat',
    'retreat center',
    'spiritual retreat software',
    'ashram',
    'wellness retreat',
    'spiritual retreat management',
    'program scheduling',
    'spiritual retreat practice',
    'spiritual retreat scheduling',
    'accommodation booking',
    'spiritual retreat crm',
    'practitioner management',
    'spiritual retreat business',
    'participant registration',
    'spiritual retreat pos',
    'meditation retreat',
    'spiritual retreat operations',
    'yoga retreat',
    'spiritual retreat platform',
    'silent retreat',
  ],

  synonyms: [
    'spiritual retreat platform',
    'spiritual retreat software',
    'retreat center software',
    'ashram software',
    'wellness retreat software',
    'program scheduling software',
    'spiritual retreat practice software',
    'accommodation booking software',
    'practitioner management software',
    'participant registration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and bookings' },
    { id: 'admin', name: 'Retreat Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedule and guests' },
  ],

  roles: [
    { id: 'admin', name: 'Retreat Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'facilitator', name: 'Program Facilitator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'coordinator', name: 'Guest Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
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
    'team-management',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious-spiritual',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a spiritual retreat platform',
    'Create a retreat center portal',
    'I need a retreat management system',
    'Build a program and accommodation platform',
    'Create a guest registration app',
  ],
};
