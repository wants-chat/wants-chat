/**
 * Towing Service App Type Definition
 *
 * Complete definition for towing and roadside assistance applications.
 * Essential for towing companies, roadside assistance providers, and auto recovery services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWING_APP_TYPE: AppTypeDefinition = {
  id: 'towing',
  name: 'Towing Service',
  category: 'automotive',
  description: 'Towing platform with dispatch management, GPS tracking, roadside assistance, and impound management',
  icon: 'truck-pickup',

  keywords: [
    'towing',
    'tow truck',
    'roadside assistance',
    'aaa',
    'auto recovery',
    'vehicle towing',
    'emergency towing',
    'flatbed towing',
    'motorcycle towing',
    'long distance towing',
    'impound',
    'accident recovery',
    'breakdown service',
    'jump start',
    'flat tire',
    'lockout service',
    'fuel delivery',
    'winch out',
    'heavy duty towing',
    'towing dispatch',
    'wrecker service',
    'roadside service',
  ],

  synonyms: [
    'towing platform',
    'tow truck software',
    'towing dispatch software',
    'roadside assistance app',
    'towing company software',
    'towing management',
    'wrecker software',
    'towing service app',
    'auto recovery software',
    'towing business app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Request towing and track status' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dispatcher', layout: 'admin', description: 'Dispatch and fleet management' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/calls' },
    { id: 'dispatcher', name: 'Dispatcher', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Tow Truck Driver', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'fleet-tracking',
    'route-optimization',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'invoicing',
    'reporting',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a towing dispatch platform',
    'Create a roadside assistance app',
    'I need a tow truck management software',
    'Build a towing company management system',
    'Create a towing service app like AAA',
  ],
};
