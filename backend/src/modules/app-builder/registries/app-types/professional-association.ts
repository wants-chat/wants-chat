/**
 * Professional Association App Type Definition
 *
 * Complete definition for professional association and industry group applications.
 * Essential for professional associations, trade groups, and industry organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROFESSIONAL_ASSOCIATION_APP_TYPE: AppTypeDefinition = {
  id: 'professional-association',
  name: 'Professional Association',
  category: 'community',
  description: 'Professional association platform with member directory, certifications, conferences, and continuing education',
  icon: 'briefcase',

  keywords: [
    'professional association',
    'trade association',
    'industry association',
    'professional organization',
    'member organization',
    'professional society',
    'industry group',
    'professional network',
    'certification body',
    'continuing education',
    'professional development',
    'industry conference',
    'trade show',
    'member directory',
    'professional community',
    'industry standards',
    'accreditation',
    'professional credentials',
    'chapter management',
    'industry advocacy',
    'professional certification',
  ],

  synonyms: [
    'professional association platform',
    'association management software',
    'trade association software',
    'professional organization app',
    'membership organization software',
    'association portal',
    'professional society software',
    'member organization platform',
    'industry association software',
    'professional network platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Resources and networking' },
    { id: 'admin', name: 'Association Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Members and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'board', name: 'Board Member', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/board' },
    { id: 'staff', name: 'Staff', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/members' },
    { id: 'chapter', name: 'Chapter Leader', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/chapter' },
    { id: 'volunteer', name: 'Committee Member', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/committees' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'community',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a professional association platform',
    'Create a trade association member portal',
    'I need an industry organization management system',
    'Build an association with certifications',
    'Create a professional society app',
  ],
};
