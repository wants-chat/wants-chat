/**
 * Youth Center App Type Definition
 *
 * Complete definition for youth center services.
 * Essential for youth centers, teen programs, and after-school activities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'youth-center',
  name: 'Youth Center',
  category: 'community',
  description: 'Youth center platform with program enrollment, attendance tracking, parent communication, and activity management',
  icon: 'smile',

  keywords: [
    'youth center',
    'teen programs',
    'youth center software',
    'after school',
    'youth activities',
    'youth center management',
    'program enrollment',
    'youth center practice',
    'youth center scheduling',
    'attendance tracking',
    'youth center crm',
    'parent communication',
    'youth center business',
    'summer programs',
    'youth center pos',
    'mentoring',
    'youth center operations',
    'sports leagues',
    'youth center platform',
    'youth development',
  ],

  synonyms: [
    'youth center platform',
    'youth center software',
    'teen programs software',
    'after school software',
    'youth activities software',
    'program enrollment software',
    'youth center practice software',
    'attendance tracking software',
    'parent communication software',
    'youth development software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and updates' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Youth and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Center Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Program Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Youth Worker', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attendance' },
    { id: 'parent', name: 'Parent/Guardian', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'check-in',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'alcohol-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'nonprofit',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a youth center management platform',
    'Create a teen programs portal',
    'I need an after-school program system',
    'Build a youth activities platform',
    'Create a parent communication and enrollment app',
  ],
};
