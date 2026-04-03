/**
 * Plumbing School App Type Definition
 *
 * Complete definition for plumbing trade education operations.
 * Essential for plumbing schools, apprenticeship programs, and trade centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLUMBING_SCHOOL_APP_TYPE: AppTypeDefinition = {
  id: 'plumbing-school',
  name: 'Plumbing School',
  category: 'education',
  description: 'Plumbing school platform with hands-on training, code compliance education, apprenticeship hours, and exam prep',
  icon: 'droplet',

  keywords: [
    'plumbing school',
    'plumber training',
    'plumbing school software',
    'trade school',
    'pipefitting',
    'plumbing school management',
    'hands-on training',
    'plumbing school practice',
    'plumbing school scheduling',
    'code compliance',
    'plumbing school crm',
    'apprenticeship hours',
    'plumbing school business',
    'exam prep',
    'plumbing school pos',
    'journeyman plumber',
    'plumbing school operations',
    'master plumber',
    'plumbing school platform',
    'ipc code',
  ],

  synonyms: [
    'plumbing school platform',
    'plumbing school software',
    'plumber training software',
    'trade school software',
    'pipefitting software',
    'hands-on training software',
    'plumbing school practice software',
    'code compliance software',
    'apprenticeship hours software',
    'journeyman plumber software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Apprentice Portal', enabled: true, basePath: '/', layout: 'public', description: 'Training and progress' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and licensing' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Plumber', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/students' },
    { id: 'staff', name: 'Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/hours' },
    { id: 'student', name: 'Apprentice', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a plumbing school platform',
    'Create a plumber training portal',
    'I need a plumbing trade system',
    'Build an apprenticeship tracking platform',
    'Create a plumbing exam prep app',
  ],
};
