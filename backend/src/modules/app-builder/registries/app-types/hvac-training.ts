/**
 * HVAC Training App Type Definition
 *
 * Complete definition for HVAC training operations.
 * Essential for HVAC trade schools and technician training programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HVAC_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'hvac-training',
  name: 'HVAC Training',
  category: 'education',
  description: 'HVAC training platform with course scheduling, equipment training, EPA certification, and job placement',
  icon: 'thermometer',

  keywords: [
    'hvac training',
    'hvac school',
    'hvac training software',
    'hvac technician',
    'refrigeration training',
    'hvac training management',
    'course scheduling',
    'hvac training practice',
    'hvac training scheduling',
    'equipment training',
    'hvac training crm',
    'epa certification',
    'hvac training business',
    'job placement',
    'hvac training pos',
    'air conditioning',
    'hvac training operations',
    'heating systems',
    'hvac training platform',
    'duct work training',
  ],

  synonyms: [
    'hvac training platform',
    'hvac training software',
    'hvac school software',
    'hvac technician software',
    'refrigeration training software',
    'course scheduling software',
    'hvac training practice software',
    'equipment training software',
    'epa certification software',
    'heating systems software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and certifications' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'School Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'HVAC Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/enrollment' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an HVAC training platform',
    'Create an HVAC school portal',
    'I need an HVAC technician training system',
    'Build an EPA certification platform',
    'Create an equipment training and job placement app',
  ],
};
