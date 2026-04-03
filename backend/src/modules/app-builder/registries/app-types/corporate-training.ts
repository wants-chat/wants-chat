/**
 * Corporate Training App Type Definition
 *
 * Complete definition for corporate training and professional development applications.
 * Essential for corporate L&D, training companies, and professional development programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CORPORATE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'corporate-training',
  name: 'Corporate Training',
  category: 'business',
  description: 'Corporate training platform with course management, employee progress tracking, compliance training, and certifications',
  icon: 'briefcase',

  keywords: [
    'corporate training',
    'employee training',
    'professional development',
    'workplace training',
    'business training',
    'leadership training',
    'management training',
    'compliance training',
    'onboarding',
    'skills training',
    'soft skills',
    'team training',
    'executive coaching',
    'sales training',
    'customer service training',
    'safety training',
    'hr training',
    'diversity training',
    'learning and development',
    'l&d',
    'upskilling',
  ],

  synonyms: [
    'corporate training platform',
    'corporate training software',
    'employee training software',
    'professional development app',
    'workplace learning platform',
    'corporate lms',
    'business training software',
    'l&d platform',
    'training management system',
    'enterprise learning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Learner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Access training and track progress' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'trainer', layout: 'admin', description: 'Courses and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'L&D Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Training Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courses' },
    { id: 'trainer', name: 'Trainer/Facilitator', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'hr', name: 'HR Admin', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/compliance' },
    { id: 'supervisor', name: 'Team Manager', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/team' },
    { id: 'employee', name: 'Employee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'settings',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'business',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'corporate',

  examplePrompts: [
    'Build a corporate training platform',
    'Create an employee learning management system',
    'I need a compliance training tracker',
    'Build a professional development platform',
    'Create a corporate L&D solution',
  ],
};
