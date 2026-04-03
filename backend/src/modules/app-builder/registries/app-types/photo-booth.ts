/**
 * Photo Booth App Type Definition
 *
 * Complete definition for photo booth rental operations.
 * Essential for photo booth services, event photography, and memory stations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHOTO_BOOTH_APP_TYPE: AppTypeDefinition = {
  id: 'photo-booth',
  name: 'Photo Booth',
  category: 'entertainment',
  description: 'Photo booth platform with booking management, gallery sharing, customization options, and print ordering',
  icon: 'camera',

  keywords: [
    'photo booth',
    'photo booth rental',
    'photo booth software',
    'event photography',
    'memory station',
    'photo booth management',
    'booking management',
    'photo booth practice',
    'photo booth scheduling',
    'gallery sharing',
    'photo booth crm',
    'customization options',
    'photo booth business',
    'print ordering',
    'photo booth pos',
    'selfie station',
    'photo booth operations',
    'backdrop rental',
    'photo booth platform',
    'props service',
  ],

  synonyms: [
    'photo booth platform',
    'photo booth software',
    'photo booth rental software',
    'event photography software',
    'memory station software',
    'booking management software',
    'photo booth practice software',
    'gallery sharing software',
    'customization options software',
    'props service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and galleries' },
    { id: 'admin', name: 'Business Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'attendant', name: 'Booth Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build a photo booth platform',
    'Create a photo booth rental portal',
    'I need a photo booth management system',
    'Build a gallery sharing platform',
    'Create a booking and customization app',
  ],
};
