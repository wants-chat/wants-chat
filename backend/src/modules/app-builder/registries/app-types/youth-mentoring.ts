/**
 * Youth Mentoring App Type Definition
 *
 * Complete definition for youth mentoring program operations.
 * Essential for mentoring organizations, big brother/sister programs, and youth development.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_MENTORING_APP_TYPE: AppTypeDefinition = {
  id: 'youth-mentoring',
  name: 'Youth Mentoring',
  category: 'nonprofit',
  description: 'Youth mentoring platform with mentor matching, activity tracking, progress reporting, and communication tools',
  icon: 'users',

  keywords: [
    'youth mentoring',
    'mentoring program',
    'youth mentoring software',
    'big brother sister',
    'youth development',
    'youth mentoring management',
    'mentor matching',
    'youth mentoring practice',
    'youth mentoring scheduling',
    'activity tracking',
    'youth mentoring crm',
    'progress reporting',
    'youth mentoring business',
    'communication tools',
    'youth mentoring pos',
    'at risk youth',
    'youth mentoring operations',
    'volunteer mentors',
    'youth mentoring platform',
    'goal setting',
  ],

  synonyms: [
    'youth mentoring platform',
    'youth mentoring software',
    'mentoring program software',
    'big brother sister software',
    'youth development software',
    'mentor matching software',
    'youth mentoring practice software',
    'activity tracking software',
    'progress reporting software',
    'at risk youth software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Participant Portal', enabled: true, basePath: '/', layout: 'public', description: 'Activities and updates' },
    { id: 'admin', name: 'Program Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Matches and progress' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Match Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/matches' },
    { id: 'mentor', name: 'Mentor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-mentee' },
    { id: 'participant', name: 'Family/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'crm',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'calendar',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'inspiring',

  examplePrompts: [
    'Build a youth mentoring platform',
    'Create a mentoring program app',
    'I need a big brother/sister system',
    'Build a youth development app',
    'Create a youth mentoring portal',
  ],
};
