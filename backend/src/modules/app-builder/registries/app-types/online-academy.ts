/**
 * Online Academy App Type Definition
 *
 * Complete definition for online academy and e-learning platform applications.
 * Essential for online schools, course creators, and digital education providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_ACADEMY_APP_TYPE: AppTypeDefinition = {
  id: 'online-academy',
  name: 'Online Academy',
  category: 'education',
  description: 'Online academy platform with course creation, video hosting, student management, and monetization',
  icon: 'graduation-cap',

  keywords: [
    'online academy',
    'online courses',
    'e-learning',
    'online school',
    'digital courses',
    'course platform',
    'video courses',
    'online education',
    'masterclass',
    'skillshare',
    'udemy',
    'teachable',
    'thinkific',
    'kajabi',
    'course creator',
    'online classes',
    'digital learning',
    'self-paced learning',
    'video lessons',
    'online certification',
    'knowledge business',
  ],

  synonyms: [
    'online academy platform',
    'online course platform',
    'e-learning platform',
    'course creation software',
    'online school software',
    'digital course platform',
    'video course software',
    'course hosting platform',
    'online education app',
    'learning platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Student Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse and take courses' },
    { id: 'admin', name: 'Creator Dashboard', enabled: true, basePath: '/admin', requiredRole: 'instructor', layout: 'admin', description: 'Create and manage courses' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Instructor', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/courses' },
    { id: 'assistant', name: 'Course Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'moderator', name: 'Community Moderator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/community' },
    { id: 'student', name: 'Student', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'analytics',
    'calendar',
    'notifications',
    'search',
    'lms',
    'course-management',
    'assignments',
    'grading',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'certificates',
    'transcripts',
    'student-records',
    'enrollment',
  ],

  incompatibleFeatures: ['medical-records', 'table-reservations', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'education',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an online academy platform',
    'Create a course selling platform like Teachable',
    'I need an e-learning platform with video hosting',
    'Build an online course platform with subscriptions',
    'Create a digital learning academy',
  ],
};
