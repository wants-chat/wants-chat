/**
 * Electrician Training App Type Definition
 *
 * Complete definition for electrician training operations.
 * Essential for electrical trade schools and apprenticeship programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ELECTRICIAN_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'electrician-training',
  name: 'Electrician Training',
  category: 'education',
  description: 'Electrician training platform with course scheduling, code training, apprenticeship management, and licensing prep',
  icon: 'zap',

  keywords: [
    'electrician training',
    'electrical school',
    'electrician training software',
    'electrical apprentice',
    'wiring training',
    'electrician training management',
    'course scheduling',
    'electrician training practice',
    'electrician training scheduling',
    'code training',
    'electrician training crm',
    'apprenticeship management',
    'electrician training business',
    'licensing prep',
    'electrician training pos',
    'nec code',
    'electrician training operations',
    'residential electrical',
    'electrician training platform',
    'commercial electrical',
  ],

  synonyms: [
    'electrician training platform',
    'electrician training software',
    'electrical school software',
    'electrical apprentice software',
    'wiring training software',
    'course scheduling software',
    'electrician training practice software',
    'code training software',
    'apprenticeship management software',
    'licensing prep software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and licensing' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and apprenticeships' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Electrician', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
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

  defaultColorScheme: 'yellow',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an electrician training platform',
    'Create an electrical school portal',
    'I need an electrician apprenticeship management system',
    'Build a licensing prep platform',
    'Create a code training and certification app',
  ],
};
