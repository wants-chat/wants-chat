/**
 * DJ Service App Type Definition
 *
 * Complete definition for DJ service operations.
 * Essential for mobile DJs, event DJs, and music entertainment services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DJ_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'dj-service',
  name: 'DJ Service',
  category: 'entertainment',
  description: 'DJ service platform with booking management, music requests, equipment inventory, and client communication',
  icon: 'headphones',

  keywords: [
    'dj service',
    'mobile dj',
    'dj service software',
    'event dj',
    'music entertainment',
    'dj service management',
    'booking management',
    'dj service practice',
    'dj service scheduling',
    'music requests',
    'dj service crm',
    'equipment inventory',
    'dj service business',
    'client communication',
    'dj service pos',
    'wedding dj',
    'dj service operations',
    'party dj',
    'dj service platform',
    'playlist planning',
  ],

  synonyms: [
    'dj service platform',
    'dj service software',
    'mobile dj software',
    'event dj software',
    'music entertainment software',
    'booking management software',
    'dj service practice software',
    'music requests software',
    'equipment inventory software',
    'playlist planning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and requests' },
    { id: 'admin', name: 'DJ Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dj', name: 'Lead DJ', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'assistant', name: 'DJ Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
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
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a DJ service platform',
    'Create a mobile DJ portal',
    'I need a DJ booking management system',
    'Build a music request platform',
    'Create an equipment and event app',
  ],
};
