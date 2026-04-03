/**
 * Aquaculture App Type Definition
 *
 * Complete definition for aquaculture and fish farming applications.
 * Essential for fish farms, shrimp farms, and aquatic farming operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUACULTURE_APP_TYPE: AppTypeDefinition = {
  id: 'aquaculture',
  name: 'Aquaculture',
  category: 'agriculture',
  description: 'Aquaculture platform with pond management, water quality monitoring, feeding management, and harvest tracking',
  icon: 'fish',

  keywords: [
    'aquaculture',
    'fish farming',
    'fish farm',
    'shrimp farming',
    'aquaculture management',
    'pond management',
    'water quality',
    'fish tracking',
    'aquafarming',
    'fish health',
    'aquaculture software',
    'hatchery management',
    'feeding management',
    'fish harvest',
    'recirculating aquaculture',
    'RAS',
    'fish production',
    'aquatic farming',
    'mariculture',
    'fish inventory',
  ],

  synonyms: [
    'aquaculture platform',
    'aquaculture software',
    'fish farming software',
    'fish farm management software',
    'aquaculture management software',
    'pond management software',
    'hatchery management software',
    'aquafarming software',
    'RAS management software',
    'fish production software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'aquarium hobby'],

  sections: [
    { id: 'frontend', name: 'Farm Portal', enabled: true, basePath: '/', layout: 'public', description: 'Production overview' },
    { id: 'admin', name: 'Aquaculture Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Ponds and production' },
  ],

  roles: [
    { id: 'admin', name: 'Farm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Farm Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/ponds' },
    { id: 'biologist', name: 'Aquatic Biologist', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/health' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/water' },
    { id: 'worker', name: 'Farm Worker', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'technical',

  examplePrompts: [
    'Build an aquaculture management platform',
    'Create a fish farming app',
    'I need a pond management system',
    'Build a shrimp farm management app',
    'Create a fish farm production tracker',
  ],
};
