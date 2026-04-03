/**
 * Child Psychology Practice App Type Definition
 *
 * Complete definition for child psychology practice operations.
 * Essential for child psychologists, pediatric therapists, and family counseling centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHILD_PSYCHOLOGY_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'child-psychology-practice',
  name: 'Child Psychology Practice',
  category: 'healthcare',
  description: 'Child psychology platform with appointment scheduling, treatment tracking, parent coordination, and progress assessments',
  icon: 'brain',

  keywords: [
    'child psychology practice',
    'child psychologist',
    'child psychology practice software',
    'pediatric therapy',
    'family counseling',
    'child psychology practice management',
    'appointment scheduling',
    'child psychology practice practice',
    'child psychology practice scheduling',
    'treatment tracking',
    'child psychology practice crm',
    'parent coordination',
    'child psychology practice business',
    'progress assessments',
    'child psychology practice pos',
    'play therapy',
    'child psychology practice operations',
    'behavioral therapy',
    'child psychology practice platform',
    'adhd treatment',
  ],

  synonyms: [
    'child psychology practice platform',
    'child psychology practice software',
    'child psychologist software',
    'pediatric therapy software',
    'family counseling software',
    'appointment scheduling software',
    'child psychology practice practice software',
    'treatment tracking software',
    'parent coordination software',
    'play therapy software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and resources' },
    { id: 'admin', name: 'Practice Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Patients and treatments' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'psychologist', name: 'Psychologist', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/patients' },
    { id: 'therapist', name: 'Therapist', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'parent', name: 'Parent/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'feedback',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build a child psychology practice platform',
    'Create a child psychologist app',
    'I need a pediatric therapy system',
    'Build a family counseling center app',
    'Create a child psychology practice portal',
  ],
};
