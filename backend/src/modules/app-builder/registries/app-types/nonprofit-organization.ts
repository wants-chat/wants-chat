/**
 * Nonprofit Organization App Type Definition
 *
 * Complete definition for nonprofit organization and charity applications.
 * Essential for nonprofits, charities, NGOs, and social impact organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NONPROFIT_ORGANIZATION_APP_TYPE: AppTypeDefinition = {
  id: 'nonprofit-organization',
  name: 'Nonprofit Organization',
  category: 'community',
  description: 'Nonprofit platform with donor management, volunteer coordination, program tracking, and impact reporting',
  icon: 'heart-handshake',

  keywords: [
    'nonprofit',
    'non-profit',
    'charity',
    'ngo',
    'foundation',
    'social impact',
    'donor management',
    'nonprofit software',
    'bloomerang',
    'little green light',
    'fundraising',
    'grants',
    'volunteer management',
    'program management',
    'impact reporting',
    'donor relations',
    'charitable giving',
    '501c3',
    'nonprofit crm',
    'mission driven',
    'social good',
  ],

  synonyms: [
    'nonprofit platform',
    'nonprofit software',
    'charity software',
    'ngo software',
    'nonprofit management system',
    'charity management',
    'donor management software',
    'nonprofit crm',
    'foundation software',
    'social impact platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Donate and get involved' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Donors and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'development', name: 'Development Officer', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/donors' },
    { id: 'coordinator', name: 'Volunteer Coordinator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/volunteers' },
    { id: 'staff', name: 'Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
    { id: 'volunteer', name: 'Volunteer', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/volunteer' },
    { id: 'donor', name: 'Donor/Supporter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'workout-plans', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'community',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a nonprofit management platform',
    'Create a charity donor management app',
    'I need an NGO program tracking system',
    'Build a foundation with donor CRM',
    'Create a social impact organization platform',
  ],
};
