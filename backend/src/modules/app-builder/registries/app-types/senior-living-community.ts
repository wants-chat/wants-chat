/**
 * Senior Living Community App Type Definition
 *
 * Complete definition for senior living community operations.
 * Essential for retirement communities, independent living facilities, and active adult communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_LIVING_COMMUNITY_APP_TYPE: AppTypeDefinition = {
  id: 'senior-living-community',
  name: 'Senior Living Community',
  category: 'real-estate',
  description: 'Senior living platform with resident management, community activities, maintenance requests, and amenity booking',
  icon: 'home',

  keywords: [
    'senior living community',
    'retirement community',
    'senior living community software',
    'independent living',
    'active adult',
    'senior living community management',
    'resident management',
    'senior living community practice',
    'senior living community scheduling',
    'community activities',
    'senior living community crm',
    'maintenance requests',
    'senior living community business',
    'amenity booking',
    'senior living community pos',
    'senior apartments',
    'senior living community operations',
    '55 plus community',
    'senior living community platform',
    'continuing care',
  ],

  synonyms: [
    'senior living community platform',
    'senior living community software',
    'retirement community software',
    'independent living software',
    'active adult software',
    'resident management software',
    'senior living community practice software',
    'community activities software',
    'maintenance requests software',
    'senior apartments software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'childcare'],

  sections: [
    { id: 'frontend', name: 'Resident Portal', enabled: true, basePath: '/', layout: 'public', description: 'Community and amenities' },
    { id: 'admin', name: 'Community Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Residents and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Community Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Property Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/residents' },
    { id: 'staff', name: 'Community Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/maintenance' },
    { id: 'resident', name: 'Resident', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'calendar',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'sage',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a senior living community platform',
    'Create a retirement community app',
    'I need an independent living system',
    'Build an active adult community app',
    'Create a senior living portal',
  ],
};
