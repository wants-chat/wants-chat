/**
 * Wellness Coaching App Type Definition
 *
 * Complete definition for wellness coaching practice applications.
 * Essential for wellness coaches, health coaches, and holistic practitioners.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELLNESS_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'wellness-coaching',
  name: 'Wellness Coaching',
  category: 'wellness',
  description: 'Wellness coaching platform with client management, session scheduling, program delivery, and progress tracking',
  icon: 'heart-pulse',

  keywords: [
    'wellness coaching',
    'wellness coach',
    'health coaching',
    'health coach',
    'wellness coaching software',
    'coaching platform',
    'wellness programs',
    'coaching scheduling',
    'coaching clients',
    'holistic coaching',
    'life wellness coach',
    'coaching sessions',
    'wellness practice',
    'coaching business',
    'wellness consultant',
    'coaching packages',
    'wellness mentoring',
    'coaching appointments',
    'wellness guidance',
    'integrative coaching',
  ],

  synonyms: [
    'wellness coaching platform',
    'wellness coaching software',
    'health coaching software',
    'coaching practice software',
    'wellness coach software',
    'coaching scheduling software',
    'wellness program software',
    'coaching client software',
    'holistic coaching software',
    'coaching management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'sports coaching'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and sessions' },
    { id: 'admin', name: 'Coach Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coach', layout: 'admin', description: 'Clients and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Practice Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Wellness Coach', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/clients' },
    { id: 'associate', name: 'Associate Coach', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'trainer-booking',
    'workout-tracking',
    'body-measurements',
    'nutrition-tracking',
    'clients',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'class-scheduling',
    'membership-plans',
    'fitness-challenges',
    'group-training',
    'class-packages',
    'documents',
    'messaging',
    'analytics',
  ],

  incompatibleFeatures: ['ticket-sales', 'shipping', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'wellness',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'calming',

  examplePrompts: [
    'Build a wellness coaching platform',
    'Create a health coach practice app',
    'I need a wellness coaching management system',
    'Build a coaching client portal',
    'Create a holistic coaching platform',
  ],
};
