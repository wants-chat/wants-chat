/**
 * Volunteer Management App Type Definition
 *
 * Complete definition for volunteer management and coordination applications.
 * Essential for volunteer programs, service organizations, and community service.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLUNTEER_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'volunteer-management',
  name: 'Volunteer Management',
  category: 'community',
  description: 'Volunteer management platform with opportunity listings, hour tracking, scheduling, and impact reporting',
  icon: 'hand-helping',

  keywords: [
    'volunteer management',
    'volunteer coordination',
    'volunteer scheduling',
    'volunteer hours',
    'volunteer tracking',
    'volunteer program',
    'volunteer opportunities',
    'volunteer signup',
    'community service',
    'volunteermatch',
    'galaxydigital',
    'volunteer hub',
    'volunteer database',
    'volunteer recruitment',
    'volunteer engagement',
    'volunteer recognition',
    'service hours',
    'volunteer shifts',
    'volunteer portal',
    'impact tracking',
    'volunteer events',
  ],

  synonyms: [
    'volunteer management platform',
    'volunteer software',
    'volunteer coordination software',
    'volunteer scheduling software',
    'volunteer tracking software',
    'volunteer program software',
    'volunteer management app',
    'volunteer portal',
    'community service software',
    'volunteer engagement platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Volunteer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Find and sign up' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coordinator', layout: 'admin', description: 'Volunteers and opportunities' },
  ],

  roles: [
    { id: 'admin', name: 'Program Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Volunteer Coordinator', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/volunteers' },
    { id: 'leader', name: 'Team Leader', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/team' },
    { id: 'partner', name: 'Partner Organization', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/opportunities' },
    { id: 'volunteer', name: 'Volunteer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'calendar',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'community',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a volunteer management platform',
    'Create a volunteer scheduling system',
    'I need a volunteer hour tracking app',
    'Build a volunteer opportunity marketplace',
    'Create a community service management app',
  ],
};
