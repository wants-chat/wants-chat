/**
 * Alumni Network App Type Definition
 *
 * Complete definition for alumni network and graduate community applications.
 * Essential for universities, schools, and educational institution alumni programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALUMNI_NETWORK_APP_TYPE: AppTypeDefinition = {
  id: 'alumni-network',
  name: 'Alumni Network',
  category: 'community',
  description: 'Alumni network platform with member directory, events, mentorship programs, and giving campaigns',
  icon: 'graduation-cap',

  keywords: [
    'alumni network',
    'alumni association',
    'alumni platform',
    'graduate network',
    'alumni directory',
    'alumni events',
    'class reunion',
    'alumni giving',
    'alumni mentorship',
    'alumni engagement',
    'university alumni',
    'college alumni',
    'school alumni',
    'alumni relations',
    'alumni community',
    'alumni careers',
    'alumni networking',
    'class notes',
    'alumni magazine',
    'homecoming',
    'alumni chapters',
  ],

  synonyms: [
    'alumni network platform',
    'alumni software',
    'alumni management software',
    'alumni association software',
    'graduate network platform',
    'alumni engagement platform',
    'alumni directory software',
    'alumni community app',
    'alumni relations software',
    'alumni networking app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Alumni Portal', enabled: true, basePath: '/', layout: 'public', description: 'Connect and engage' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and campaigns' },
  ],

  roles: [
    { id: 'admin', name: 'Alumni Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'staff', name: 'Alumni Staff', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'ambassador', name: 'Class Ambassador', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/class' },
    { id: 'mentor', name: 'Mentor', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/mentorship' },
    { id: 'alumnus', name: 'Alumnus', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'messaging',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'education',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build an alumni network platform',
    'Create a university alumni association app',
    'I need an alumni engagement system',
    'Build an alumni directory with mentorship',
    'Create a graduate network platform',
  ],
};
