/**
 * Equestrian Center App Type Definition
 *
 * Complete definition for equestrian center operations.
 * Essential for horse barns, riding stables, and equine facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EQUESTRIAN_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'equestrian-center',
  name: 'Equestrian Center',
  category: 'sports',
  description: 'Equestrian center platform with stall management, lesson scheduling, horse care tracking, and show registration',
  icon: 'horse',

  keywords: [
    'equestrian center',
    'horse barn',
    'equestrian center software',
    'riding stable',
    'equine facility',
    'equestrian center management',
    'stall management',
    'equestrian center practice',
    'equestrian center scheduling',
    'lesson scheduling',
    'equestrian center crm',
    'horse care tracking',
    'equestrian center business',
    'show registration',
    'equestrian center pos',
    'boarding',
    'equestrian center operations',
    'trail rides',
    'equestrian center platform',
    'dressage',
  ],

  synonyms: [
    'equestrian center platform',
    'equestrian center software',
    'horse barn software',
    'riding stable software',
    'equine facility software',
    'stall management software',
    'equestrian center practice software',
    'lesson scheduling software',
    'horse care tracking software',
    'boarding software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and horses' },
    { id: 'admin', name: 'Barn Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Stalls and care' },
  ],

  roles: [
    { id: 'admin', name: 'Barn Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Barn Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/horses' },
    { id: 'trainer', name: 'Riding Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'client', name: 'Rider/Boarder', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'equestrian',

  examplePrompts: [
    'Build an equestrian center platform',
    'Create a horse stable management app',
    'I need a riding lesson scheduling system',
    'Build a horse boarding facility app',
    'Create an equestrian center portal',
  ],
};
