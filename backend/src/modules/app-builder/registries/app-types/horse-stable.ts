/**
 * Horse Stable App Type Definition
 *
 * Complete definition for horse stables and equestrian centers.
 * Essential for horse stables, riding schools, and equine facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HORSE_STABLE_APP_TYPE: AppTypeDefinition = {
  id: 'horse-stable',
  name: 'Horse Stable',
  category: 'pets',
  description: 'Horse stable platform with stall management, lesson booking, horse care tracking, and boarder management',
  icon: 'heart',

  keywords: [
    'horse stable',
    'equestrian center',
    'stable software',
    'riding school',
    'horse boarding',
    'stable management',
    'equine facility',
    'horse lessons',
    'stable booking',
    'horse care',
    'stable crm',
    'equestrian software',
    'horse barn',
    'riding lessons',
    'stable operations',
    'horse show',
    'stable business',
    'horse training',
    'stable pos',
    'equine management',
  ],

  synonyms: [
    'horse stable platform',
    'horse stable software',
    'equestrian center software',
    'stable management software',
    'riding school software',
    'horse boarding software',
    'equine facility software',
    'stable booking software',
    'horse care software',
    'equestrian management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'crypto stable'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lessons and horses' },
    { id: 'admin', name: 'Stable Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Horses and stalls' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Stable Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/horses' },
    { id: 'instructor', name: 'Instructor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/stalls' },
    { id: 'boarder', name: 'Boarder', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/boarder' },
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
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'product-catalog'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'pets',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a horse stable management platform',
    'Create an equestrian center booking app',
    'I need a riding school scheduling system',
    'Build a horse boarding management app',
    'Create a stable operations platform',
  ],
};
