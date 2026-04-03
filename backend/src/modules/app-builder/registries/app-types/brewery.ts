/**
 * Brewery App Type Definition
 *
 * Complete definition for brewery and craft beer applications.
 * Essential for craft breweries, brewpubs, and taprooms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BREWERY_APP_TYPE: AppTypeDefinition = {
  id: 'brewery',
  name: 'Brewery',
  category: 'food-beverage',
  description: 'Brewery platform with beer catalog, taproom management, merchandise sales, and beer club subscriptions',
  icon: 'beer',

  keywords: [
    'brewery',
    'craft brewery',
    'brewpub',
    'taproom',
    'craft beer',
    'beer club',
    'beer subscription',
    'brewery tours',
    'beer tasting',
    'microbrewery',
    'beer sales',
    'beer menu',
    'beer releases',
    'brewery events',
    'beer garden',
    'beer merchandise',
    'growler fills',
    'brewery app',
    'beer finder',
    'beer production',
  ],

  synonyms: [
    'brewery platform',
    'brewery software',
    'craft brewery software',
    'taproom software',
    'brewery management software',
    'beer club software',
    'brewpub software',
    'brewery pos',
    'beer subscription software',
    'brewery ecommerce',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home brewing only'],

  sections: [
    { id: 'frontend', name: 'Beer Shop', enabled: true, basePath: '/', layout: 'public', description: 'Shop beer and book visits' },
    { id: 'admin', name: 'Brewery Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Beers and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Brewery Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Taproom Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/taproom' },
    { id: 'brewer', name: 'Head Brewer', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'bartender', name: 'Bartender', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/pos' },
    { id: 'member', name: 'Beer Club Member', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/member' },
    { id: 'customer', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'menu-management',
    'table-reservations',
    'food-ordering',
    'pos-system',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
    'payments',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['vehicle-tracking', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'food-beverage',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'rustic',

  examplePrompts: [
    'Build a craft brewery platform',
    'Create a taproom management app',
    'I need a beer club subscription system',
    'Build a brewery with ecommerce',
    'Create a brewpub ordering app',
  ],
};
