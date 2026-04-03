/**
 * Ecotourism App Type Definition
 *
 * Complete definition for ecotourism and sustainable travel applications.
 * Essential for eco-lodges, sustainable tour operators, and conservation tourism.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ECOTOURISM_APP_TYPE: AppTypeDefinition = {
  id: 'ecotourism',
  name: 'Ecotourism',
  category: 'travel',
  description: 'Ecotourism platform with sustainable trip booking, conservation programs, eco-lodging, and impact tracking',
  icon: 'leaf',

  keywords: [
    'ecotourism',
    'sustainable travel',
    'eco travel',
    'ecotourism software',
    'eco lodge',
    'sustainable tourism',
    'green travel',
    'conservation tourism',
    'eco tours',
    'nature tourism',
    'responsible travel',
    'eco adventures',
    'wildlife tourism',
    'eco booking',
    'sustainable trips',
    'eco vacation',
    'ecotourism business',
    'carbon offset travel',
    'eco-friendly travel',
    'nature-based tourism',
  ],

  synonyms: [
    'ecotourism platform',
    'ecotourism software',
    'sustainable travel software',
    'eco travel software',
    'eco lodge software',
    'sustainable tourism software',
    'green travel software',
    'conservation tourism software',
    'eco tour software',
    'nature tourism software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'ecosystem'],

  sections: [
    { id: 'frontend', name: 'Traveler Portal', enabled: true, basePath: '/', layout: 'public', description: 'Trips and impact' },
    { id: 'admin', name: 'Eco Dashboard', enabled: true, basePath: '/admin', requiredRole: 'guide', layout: 'admin', description: 'Tours and conservation' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'guide', name: 'Eco Guide', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tours' },
    { id: 'conservation', name: 'Conservation Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/impact' },
    { id: 'traveler', name: 'Traveler', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'email',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'travel',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build an ecotourism booking platform',
    'Create a sustainable travel app',
    'I need an eco-lodge management system',
    'Build a conservation tourism platform',
    'Create an eco-travel impact tracking app',
  ],
};
