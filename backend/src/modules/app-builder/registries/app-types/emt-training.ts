/**
 * EMT Training App Type Definition
 *
 * Complete definition for EMT training operations.
 * Essential for EMS training programs and paramedic schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EMT_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'emt-training',
  name: 'EMT Training',
  category: 'education',
  description: 'EMT training platform with course scheduling, clinical rotations, NREMT certification prep, and skills tracking',
  icon: 'heart-pulse',

  keywords: [
    'emt training',
    'ems school',
    'emt training software',
    'paramedic training',
    'first responder',
    'emt training management',
    'course scheduling',
    'emt training practice',
    'emt training scheduling',
    'clinical rotations',
    'emt training crm',
    'nremt certification',
    'emt training business',
    'skills tracking',
    'emt training pos',
    'emergency medicine',
    'emt training operations',
    'aemt training',
    'emt training platform',
    'ambulance training',
  ],

  synonyms: [
    'emt training platform',
    'emt training software',
    'ems school software',
    'paramedic training software',
    'first responder software',
    'course scheduling software',
    'emt training practice software',
    'clinical rotations software',
    'nremt certification software',
    'emergency medicine software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'ecommerce'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and certifications' },
    { id: 'admin', name: 'School Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Classes and rotations' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Lead Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'staff', name: 'Clinical Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rotations' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'ecommerce-checkout'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'medical',

  examplePrompts: [
    'Build an EMT training platform',
    'Create an EMS school portal',
    'I need a paramedic training management system',
    'Build an NREMT certification prep platform',
    'Create a clinical rotations and skills tracking app',
  ],
};
