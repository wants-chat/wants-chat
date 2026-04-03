/**
 * Aviation Training App Type Definition
 *
 * Complete definition for aviation training centers and simulators.
 * Essential for training centers, simulator facilities, and type rating schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-training',
  name: 'Aviation Training Center',
  category: 'aviation',
  description: 'Aviation training platform with course scheduling, simulator booking, certification tracking, and student management',
  icon: 'graduation-cap',

  keywords: [
    'aviation training',
    'flight simulator',
    'aviation training software',
    'type rating',
    'pilot training',
    'aviation training management',
    'course scheduling',
    'aviation training practice',
    'aviation training scheduling',
    'simulator booking',
    'aviation training crm',
    'recurrent training',
    'aviation training business',
    'atp training',
    'aviation training pos',
    'crew training',
    'aviation training operations',
    'instructor led',
    'aviation training services',
    'elearning aviation',
  ],

  synonyms: [
    'aviation training platform',
    'aviation training software',
    'flight simulator software',
    'type rating software',
    'pilot training software',
    'course scheduling software',
    'aviation training practice software',
    'simulator booking software',
    'recurrent training software',
    'crew training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Courses and bookings' },
    { id: 'admin', name: 'Training Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedule and students' },
  ],

  roles: [
    { id: 'admin', name: 'Training Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Senior Instructor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'simtech', name: 'Simulator Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/simulators' },
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
    'analytics',
    'clients',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an aviation training center platform',
    'Create a flight simulator portal',
    'I need a pilot training management system',
    'Build a type rating school platform',
    'Create a course and simulator booking app',
  ],
};
