/**
 * Jewelry Making App Type Definition
 *
 * Complete definition for jewelry making studios and metalsmithing workshops.
 * Essential for jewelry studios, metalsmithing schools, and beading workshops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_MAKING_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry-making',
  name: 'Jewelry Making Studio',
  category: 'creative',
  description: 'Jewelry making studio platform with bench rentals, class scheduling, tool management, and materials shop',
  icon: 'gem',

  keywords: [
    'jewelry making',
    'metalsmithing',
    'jewelry making software',
    'silversmithing',
    'beading studio',
    'jewelry making management',
    'bench rentals',
    'jewelry making practice',
    'jewelry making scheduling',
    'jewelry classes',
    'jewelry making crm',
    'wire wrapping',
    'jewelry making business',
    'stone setting',
    'jewelry making pos',
    'metal clay',
    'jewelry making operations',
    'soldering',
    'jewelry making services',
    'jewelry design',
  ],

  synonyms: [
    'jewelry making platform',
    'jewelry making software',
    'metalsmithing software',
    'silversmithing software',
    'beading studio software',
    'bench rentals software',
    'jewelry making practice software',
    'jewelry classes software',
    'wire wrapping software',
    'jewelry design software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Artisan Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and benches' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and tools' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Jeweler', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/materials' },
    { id: 'student', name: 'Jewelry Maker', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a jewelry making studio platform',
    'Create a metalsmithing workshop portal',
    'I need a jewelry studio management system',
    'Build a silversmithing school platform',
    'Create a jewelry class and bench booking app',
  ],
};
