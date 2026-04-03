/**
 * Indoor Playground App Type Definition
 *
 * Complete definition for indoor playground operations.
 * Essential for indoor playgrounds, play cafes, and children's entertainment centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDOOR_PLAYGROUND_APP_TYPE: AppTypeDefinition = {
  id: 'indoor-playground',
  name: 'Indoor Playground',
  category: 'entertainment',
  description: 'Indoor playground platform with session booking, party scheduling, waiver management, and capacity tracking',
  icon: 'baby',

  keywords: [
    'indoor playground',
    'play cafe',
    'indoor playground software',
    'childrens entertainment',
    'soft play',
    'indoor playground management',
    'session booking',
    'indoor playground practice',
    'indoor playground scheduling',
    'party scheduling',
    'indoor playground crm',
    'waiver management',
    'indoor playground business',
    'capacity tracking',
    'indoor playground pos',
    'toddler play',
    'indoor playground operations',
    'sensory play',
    'indoor playground platform',
    'drop in play',
  ],

  synonyms: [
    'indoor playground platform',
    'indoor playground software',
    'play cafe software',
    'childrens entertainment software',
    'soft play software',
    'session booking software',
    'indoor playground practice software',
    'party scheduling software',
    'waiver management software',
    'toddler play software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Play and parties' },
    { id: 'admin', name: 'Playground Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Sessions and capacity' },
  ],

  roles: [
    { id: 'admin', name: 'Venue Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Play Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'staff', name: 'Play Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/floor' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build an indoor playground platform',
    'Create a play cafe app',
    'I need an indoor play space system',
    'Build a childrens entertainment app',
    'Create an indoor playground portal',
  ],
};
