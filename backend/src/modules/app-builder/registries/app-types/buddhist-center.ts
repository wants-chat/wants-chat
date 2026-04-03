/**
 * Buddhist Center App Type Definition
 *
 * Complete definition for Buddhist centers and meditation temples.
 * Essential for Buddhist temples, dharma centers, and meditation communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUDDHIST_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'buddhist-center',
  name: 'Buddhist Center',
  category: 'religious',
  description: 'Buddhist center platform with meditation scheduling, dharma teachings, retreat management, and sangha community',
  icon: 'flower',

  keywords: [
    'buddhist center',
    'dharma center',
    'buddhist software',
    'meditation temple',
    'dharma teachings',
    'buddhist management',
    'meditation retreat',
    'buddhist donations',
    'buddhist events',
    'sangha',
    'buddhist crm',
    'zen center',
    'buddhist business',
    'meditation classes',
    'buddhist pos',
    'mindfulness',
    'buddhist operations',
    'dharma talks',
    'buddhist services',
    'buddhist community',
  ],

  synonyms: [
    'buddhist center platform',
    'buddhist center software',
    'dharma center software',
    'meditation temple software',
    'buddhist temple software',
    'zen center software',
    'buddhist community software',
    'meditation retreat software',
    'sangha software',
    'buddhist management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'buddhist art'],

  sections: [
    { id: 'frontend', name: 'Practitioner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Meditations and teachings' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'teacher', layout: 'admin', description: 'Programs and retreats' },
  ],

  roles: [
    { id: 'admin', name: 'Abbot', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Center Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'teacher', name: 'Teacher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/teachings' },
    { id: 'practitioner', name: 'Practitioner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build a Buddhist center platform',
    'Create a dharma center community app',
    'I need a meditation retreat management system',
    'Build a Zen center scheduling platform',
    'Create a sangha community app',
  ],
};
