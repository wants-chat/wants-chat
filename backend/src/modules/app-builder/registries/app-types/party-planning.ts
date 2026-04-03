/**
 * Party Planning App Type Definition
 *
 * Complete definition for party planning and celebration services.
 * Essential for party planners, celebration coordinators, and event hosts.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARTY_PLANNING_APP_TYPE: AppTypeDefinition = {
  id: 'party-planning',
  name: 'Party Planning',
  category: 'events',
  description: 'Party planning platform with theme selection, vendor coordination, invitation management, and entertainment booking',
  icon: 'party-popper',

  keywords: [
    'party planning',
    'party planner',
    'party planning software',
    'celebration planning',
    'event hosting',
    'party planning management',
    'theme parties',
    'party planning practice',
    'party planning scheduling',
    'birthday parties',
    'party planning crm',
    'entertainment booking',
    'party planning business',
    'venue selection',
    'party planning pos',
    'party decorations',
    'party planning operations',
    'catering coordination',
    'party planning services',
    'celebration services',
  ],

  synonyms: [
    'party planning platform',
    'party planning software',
    'party planner software',
    'celebration planning software',
    'event hosting software',
    'theme parties software',
    'party planning practice software',
    'birthday parties software',
    'entertainment booking software',
    'celebration services software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Party planning and details' },
    { id: 'admin', name: 'Planner Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Parties and vendors' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'planner', name: 'Party Planner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/parties' },
    { id: 'assistant', name: 'Event Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
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

  incompatibleFeatures: ['property-listings', 'inventory-retail', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'events',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a party planning platform',
    'Create a celebration planning portal',
    'I need a party coordination management system',
    'Build a party planner business platform',
    'Create a birthday party planning app',
  ],
};
