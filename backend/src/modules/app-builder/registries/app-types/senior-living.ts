/**
 * Senior Living App Type Definition
 *
 * Complete definition for senior living communities and retirement homes.
 * Essential for independent living, assisted living, and retirement communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_LIVING_APP_TYPE: AppTypeDefinition = {
  id: 'senior-living',
  name: 'Senior Living',
  category: 'seniors',
  description: 'Senior living platform with resident management, family portal, activity scheduling, and care coordination',
  icon: 'home',

  keywords: [
    'senior living',
    'retirement home',
    'senior living software',
    'assisted living',
    'senior community',
    'senior living management',
    'retirement community',
    'senior housing',
    'senior living scheduling',
    'independent living',
    'senior living crm',
    'elder care',
    'senior living business',
    'continuing care',
    'senior living pos',
    'senior apartments',
    'senior living operations',
    'senior amenities',
    'senior living services',
    'active adult',
  ],

  synonyms: [
    'senior living platform',
    'senior living software',
    'retirement home software',
    'assisted living software',
    'senior community software',
    'retirement community software',
    'senior housing software',
    'independent living software',
    'elder care software',
    'continuing care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'nursing home medical'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Resident updates and visits' },
    { id: 'admin', name: 'Community Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Residents and activities' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Community Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/residents' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/activities' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'calendar',
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'seniors',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a senior living community platform',
    'Create a retirement home management app',
    'I need an assisted living resident portal',
    'Build a senior community family communication system',
    'Create a retirement community management platform',
  ],
};
