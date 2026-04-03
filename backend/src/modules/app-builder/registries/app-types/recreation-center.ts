/**
 * Recreation Center App Type Definition
 *
 * Complete definition for recreation center services.
 * Essential for rec centers, parks and recreation, and municipal facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECREATION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'recreation-center',
  name: 'Recreation Center',
  category: 'community',
  description: 'Recreation center platform with facility booking, program registration, membership management, and equipment checkout',
  icon: 'activity',

  keywords: [
    'recreation center',
    'parks recreation',
    'recreation center software',
    'municipal facility',
    'rec center',
    'recreation center management',
    'facility booking',
    'recreation center practice',
    'recreation center scheduling',
    'program registration',
    'recreation center crm',
    'membership management',
    'recreation center business',
    'sports programs',
    'recreation center pos',
    'fitness classes',
    'recreation center operations',
    'pool access',
    'recreation center platform',
    'community programs',
  ],

  synonyms: [
    'recreation center platform',
    'recreation center software',
    'parks recreation software',
    'municipal facility software',
    'rec center software',
    'facility booking software',
    'recreation center practice software',
    'program registration software',
    'membership management software',
    'community programs software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and facilities' },
    { id: 'admin', name: 'Rec Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Facilities and members' },
  ],

  roles: [
    { id: 'admin', name: 'Rec Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Program Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Front Desk', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkin' },
    { id: 'member', name: 'Community Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
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
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a recreation center platform',
    'Create a parks and recreation portal',
    'I need a municipal rec center system',
    'Build a facility booking platform',
    'Create a program registration and membership app',
  ],
};
