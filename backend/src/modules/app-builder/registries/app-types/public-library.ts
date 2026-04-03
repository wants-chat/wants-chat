/**
 * Public Library App Type Definition
 *
 * Complete definition for public library and library system applications.
 * Essential for public libraries, library systems, and community libraries.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUBLIC_LIBRARY_APP_TYPE: AppTypeDefinition = {
  id: 'public-library',
  name: 'Public Library',
  category: 'government',
  description: 'Library platform with catalog search, account management, digital resources, and program registration',
  icon: 'book-open',

  keywords: [
    'public library',
    'library system',
    'library catalog',
    'library services',
    'book lending',
    'library card',
    'library programs',
    'ebook lending',
    'library events',
    'library software',
    'library management',
    'book checkout',
    'library holds',
    'library branches',
    'digital library',
    'library resources',
    'reading programs',
    'library patron',
    'book reservation',
    'library account',
  ],

  synonyms: [
    'public library platform',
    'library management software',
    'library system software',
    'library catalog software',
    'library services platform',
    'library portal software',
    'book lending software',
    'library patron software',
    'digital library platform',
    'library program software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'code library'],

  sections: [
    { id: 'frontend', name: 'Library Portal', enabled: true, basePath: '/', layout: 'public', description: 'Search and account' },
    { id: 'admin', name: 'Staff Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Circulation and management' },
  ],

  roles: [
    { id: 'admin', name: 'Library Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Branch Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/circulation' },
    { id: 'staff', name: 'Librarian', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/checkout' },
    { id: 'volunteer', name: 'Volunteer', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shelving' },
    { id: 'patron', name: 'Library Patron', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a public library platform',
    'Create a library catalog system',
    'I need a library management app',
    'Build a library patron portal',
    'Create a digital library platform',
  ],
};
