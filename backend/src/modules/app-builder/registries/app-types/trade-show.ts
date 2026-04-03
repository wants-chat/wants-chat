/**
 * Trade Show App Type Definition
 *
 * Complete definition for trade show and exhibition management.
 * Essential for trade show organizers, exhibition managers, and industry event planners.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRADE_SHOW_APP_TYPE: AppTypeDefinition = {
  id: 'trade-show',
  name: 'Trade Show',
  category: 'events',
  description: 'Trade show platform with exhibitor management, booth allocation, lead capture, and floor plan coordination',
  icon: 'store',

  keywords: [
    'trade show',
    'exhibition management',
    'trade show software',
    'industry expo',
    'trade fair',
    'trade show management',
    'exhibitor management',
    'trade show practice',
    'trade show scheduling',
    'booth allocation',
    'trade show crm',
    'lead capture',
    'trade show business',
    'floor plan',
    'trade show pos',
    'sponsor booths',
    'trade show operations',
    'attendee badges',
    'trade show services',
    'expo management',
  ],

  synonyms: [
    'trade show platform',
    'trade show software',
    'exhibition management software',
    'industry expo software',
    'trade fair software',
    'exhibitor management software',
    'trade show practice software',
    'booth allocation software',
    'lead capture software',
    'expo management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'retail'],

  sections: [
    { id: 'frontend', name: 'Exhibitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booth and leads' },
    { id: 'admin', name: 'Show Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Shows and exhibitors' },
  ],

  roles: [
    { id: 'admin', name: 'Show Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Show Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/shows' },
    { id: 'coordinator', name: 'Exhibitor Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/exhibitors' },
    { id: 'exhibitor', name: 'Exhibitor', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'events',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a trade show management platform',
    'Create an exhibition organizer portal',
    'I need a trade fair management system',
    'Build a trade show exhibitor platform',
    'Create a booth and lead capture app',
  ],
};
