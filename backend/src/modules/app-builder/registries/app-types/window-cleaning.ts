/**
 * Window Cleaning App Type Definition
 *
 * Complete definition for window cleaning service applications.
 * Essential for window cleaners, building maintenance, and commercial cleaning services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDOW_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'window-cleaning',
  name: 'Window Cleaning',
  category: 'services',
  description: 'Window cleaning platform with booking, route planning, recurring services, and crew management',
  icon: 'building',

  keywords: [
    'window cleaning',
    'window washer',
    'glass cleaning',
    'commercial window cleaning',
    'residential window cleaning',
    'high rise window cleaning',
    'storefront cleaning',
    'pressure washing windows',
    'gutter cleaning',
    'solar panel cleaning',
    'screen cleaning',
    'window tinting',
    'building maintenance',
    'exterior cleaning',
    'professional window cleaning',
    'window cleaning service',
    'squeegee',
    'water fed pole',
    'window restoration',
    'hard water removal',
    'streak free',
    'window cleaning company',
  ],

  synonyms: [
    'window cleaning platform',
    'window cleaning software',
    'window washer app',
    'window cleaning management',
    'glass cleaning software',
    'window cleaning business app',
    'window cleaning scheduling',
    'window service software',
    'building cleaning app',
    'window cleaning dispatch',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book services and get quotes' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Route and crew management' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'crew-lead', name: 'Crew Leader', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/route' },
    { id: 'technician', name: 'Window Technician', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'calendar',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'gallery',
    'reviews',
    'invoicing',
    'analytics',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'simple',
  industry: 'services',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a window cleaning business platform',
    'Create a window cleaning booking app',
    'I need a window cleaning route management software',
    'Build a commercial window cleaning company app',
    'Create a window cleaning service with scheduling',
  ],
};
