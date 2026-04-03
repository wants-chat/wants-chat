/**
 * Horse Riding App Type Definition
 *
 * Complete definition for horse riding facilities and equestrian centers.
 * Essential for riding schools, equestrian clubs, and horse training facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HORSE_RIDING_APP_TYPE: AppTypeDefinition = {
  id: 'horse-riding',
  name: 'Horse Riding',
  category: 'sports',
  description: 'Horse riding platform with lesson scheduling, horse assignments, arena booking, and rider progress tracking',
  icon: 'horse',

  keywords: [
    'horse riding',
    'equestrian center',
    'horse riding software',
    'riding school',
    'horse lessons',
    'horse riding management',
    'lesson scheduling',
    'horse riding practice',
    'horse riding scheduling',
    'arena booking',
    'horse riding crm',
    'dressage',
    'horse riding business',
    'jumping lessons',
    'horse riding pos',
    'trail rides',
    'horse riding operations',
    'rider levels',
    'horse riding services',
    'equestrian sports',
  ],

  synonyms: [
    'horse riding platform',
    'horse riding software',
    'equestrian center software',
    'riding school software',
    'horse lessons software',
    'lesson scheduling software',
    'horse riding practice software',
    'arena booking software',
    'dressage software',
    'equestrian sports software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and horses' },
    { id: 'admin', name: 'Stable Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Horses and lessons' },
  ],

  roles: [
    { id: 'admin', name: 'Stable Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Head Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lessons' },
    { id: 'groom', name: 'Stable Hand', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/horses' },
    { id: 'rider', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'sports',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'equestrian',

  examplePrompts: [
    'Build a horse riding platform',
    'Create an equestrian center portal',
    'I need a riding school management system',
    'Build a horse stable business platform',
    'Create a lesson and horse assignment app',
  ],
};
