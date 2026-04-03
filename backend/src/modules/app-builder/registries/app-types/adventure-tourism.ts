/**
 * Adventure Tourism App Type Definition
 *
 * Complete definition for adventure tourism and outdoor activity applications.
 * Essential for adventure operators, outdoor guides, and extreme sports providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADVENTURE_TOURISM_APP_TYPE: AppTypeDefinition = {
  id: 'adventure-tourism',
  name: 'Adventure Tourism',
  category: 'travel',
  description: 'Adventure tourism platform with activity booking, equipment rental, guide scheduling, and safety management',
  icon: 'mountain',

  keywords: [
    'adventure tourism',
    'adventure activities',
    'adventure booking',
    'outdoor activities',
    'adventure tours',
    'extreme sports',
    'adventure software',
    'adventure operator',
    'outdoor adventure',
    'adventure guide',
    'adventure travel',
    'zip line',
    'rafting tours',
    'hiking tours',
    'adventure business',
    'adventure scheduling',
    'adventure experiences',
    'adventure company',
    'eco adventure',
    'adventure packages',
  ],

  synonyms: [
    'adventure tourism platform',
    'adventure tourism software',
    'adventure booking software',
    'outdoor activity software',
    'adventure operator software',
    'extreme sports software',
    'adventure tour software',
    'adventure guide software',
    'outdoor adventure software',
    'adventure management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'adventure game'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Activities and booking' },
    { id: 'admin', name: 'Adventure Dashboard', enabled: true, basePath: '/admin', requiredRole: 'guide', layout: 'admin', description: 'Trips and safety' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'guide', name: 'Adventure Guide', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'safety', name: 'Safety Officer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/safety' },
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
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'travel',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'adventurous',

  examplePrompts: [
    'Build an adventure tourism platform',
    'Create an outdoor activity booking app',
    'I need an adventure tour operator system',
    'Build an extreme sports booking app',
    'Create an adventure guide scheduling platform',
  ],
};
