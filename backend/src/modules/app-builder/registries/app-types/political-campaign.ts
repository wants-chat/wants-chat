/**
 * Political Campaign App Type Definition
 *
 * Complete definition for political campaign and advocacy applications.
 * Essential for political campaigns, advocacy groups, and grassroots organizing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POLITICAL_CAMPAIGN_APP_TYPE: AppTypeDefinition = {
  id: 'political-campaign',
  name: 'Political Campaign',
  category: 'community',
  description: 'Political campaign platform with donor management, volunteer coordination, voter outreach, and event organizing',
  icon: 'vote',

  keywords: [
    'political campaign',
    'campaign management',
    'political software',
    'campaign fundraising',
    'voter outreach',
    'grassroots organizing',
    'canvassing',
    'phone banking',
    'voter database',
    'campaign donations',
    'political action',
    'advocacy campaign',
    'get out the vote',
    'gotv',
    'voter registration',
    'campaign volunteers',
    'campaign events',
    'political fundraising',
    'actblue',
    'ngp van',
    'mobilize',
  ],

  synonyms: [
    'political campaign platform',
    'campaign management software',
    'political software',
    'campaign fundraising software',
    'voter outreach platform',
    'grassroots organizing software',
    'political campaign app',
    'advocacy platform',
    'campaign volunteer software',
    'political action platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Supporter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Donate and volunteer' },
    { id: 'admin', name: 'Campaign Dashboard', enabled: true, basePath: '/admin', requiredRole: 'organizer', layout: 'admin', description: 'Voters and outreach' },
  ],

  roles: [
    { id: 'admin', name: 'Campaign Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Field Director', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/field' },
    { id: 'organizer', name: 'Organizer', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/volunteers' },
    { id: 'volunteer', name: 'Volunteer', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/canvass' },
    { id: 'supporter', name: 'Supporter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'civic',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a political campaign platform',
    'Create a campaign fundraising app',
    'I need a voter outreach system',
    'Build a grassroots organizing platform',
    'Create a campaign volunteer management app',
  ],
};
