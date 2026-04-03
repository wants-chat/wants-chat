/**
 * Church App Type Definition
 *
 * Complete definition for church and religious organization applications.
 * Essential for churches, ministries, places of worship, and religious communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CHURCH_APP_TYPE: AppTypeDefinition = {
  id: 'church',
  name: 'Church',
  category: 'community',
  description: 'Church platform with member management, event scheduling, online giving, sermons, and small groups',
  icon: 'church',

  keywords: [
    'church',
    'church management',
    'ministry',
    'congregation',
    'place of worship',
    'religious organization',
    'church software',
    'church app',
    'online giving',
    'tithely',
    'pushpay',
    'planning center',
    'sermon',
    'worship',
    'small groups',
    'bible study',
    'youth ministry',
    'childrens ministry',
    'church events',
    'member directory',
    'church community',
  ],

  synonyms: [
    'church platform',
    'church management software',
    'ministry software',
    'church app',
    'congregation software',
    'worship management',
    'church administration',
    'religious organization software',
    'church member management',
    'church community app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Events, sermons, and giving' },
    { id: 'admin', name: 'Church Dashboard', enabled: true, basePath: '/admin', requiredRole: 'pastor', layout: 'admin', description: 'Members and ministry' },
  ],

  roles: [
    { id: 'admin', name: 'Senior Pastor', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pastor', name: 'Pastor/Elder', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'leader', name: 'Ministry Leader', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/groups' },
    { id: 'volunteer', name: 'Volunteer', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'staff', name: 'Office Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calendar' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'check-in',
    'reservations',
    'email',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'course-management-lms', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'community',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a church management platform',
    'Create a church member app',
    'I need a ministry management system',
    'Build a church with online giving',
    'Create a congregation app',
  ],
};
