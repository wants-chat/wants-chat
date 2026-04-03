/**
 * Plumbing Training App Type Definition
 *
 * Complete definition for plumbing training operations.
 * Essential for plumbing trade schools and apprenticeship programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLUMBING_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'plumbing-training',
  name: 'Plumbing Training',
  category: 'education',
  description: 'Plumbing training platform with course scheduling, code compliance, apprenticeship tracking, and licensing preparation',
  icon: 'droplet',

  keywords: [
    'plumbing training',
    'plumbing school',
    'plumbing training software',
    'plumber apprentice',
    'pipefitting training',
    'plumbing training management',
    'course scheduling',
    'plumbing training practice',
    'plumbing training scheduling',
    'code compliance',
    'plumbing training crm',
    'apprenticeship tracking',
    'plumbing training business',
    'licensing preparation',
    'plumbing training pos',
    'residential plumbing',
    'plumbing training operations',
    'commercial plumbing',
    'plumbing training platform',
    'drainage systems',
  ],

  synonyms: [
    'plumbing training platform',
    'plumbing training software',
    'plumbing school software',
    'plumber apprentice software',
    'pipefitting training software',
    'course scheduling software',
    'plumbing training practice software',
    'code compliance software',
    'apprenticeship tracking software',
    'licensing preparation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and licensing' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and apprenticeships' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Plumber', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/enrollment' },
    { id: 'student', name: 'Apprentice', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
  industry: 'education',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build a plumbing training platform',
    'Create a plumbing school portal',
    'I need a plumber apprenticeship management system',
    'Build a licensing preparation platform',
    'Create a code compliance and certification app',
  ],
};
