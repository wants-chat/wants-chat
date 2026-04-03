/**
 * Water Damage Restoration App Type Definition
 *
 * Complete definition for water damage and flood restoration applications.
 * Essential for restoration companies, water damage specialists, and emergency services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_DAMAGE_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'water-damage-restoration',
  name: 'Water Damage Restoration',
  category: 'cleaning',
  description: 'Water damage restoration platform with emergency dispatch, moisture tracking, insurance documentation, and equipment management',
  icon: 'droplet',

  keywords: [
    'water damage',
    'flood restoration',
    'water restoration',
    'restoration software',
    'water mitigation',
    'restoration booking',
    'flood cleanup',
    'water damage repair',
    'restoration scheduling',
    'emergency restoration',
    'restoration crm',
    'moisture tracking',
    'restoration business',
    'water extraction',
    'restoration pos',
    'drying equipment',
    'restoration management',
    'insurance claims',
    'restoration services',
    'disaster restoration',
  ],

  synonyms: [
    'water damage restoration platform',
    'water damage restoration software',
    'flood restoration software',
    'water mitigation software',
    'restoration company software',
    'water damage repair software',
    'emergency restoration software',
    'restoration scheduling software',
    'restoration management software',
    'disaster restoration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'water sports'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Emergency requests' },
    { id: 'admin', name: 'Restoration Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Jobs and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'cleaning',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a water damage restoration platform',
    'Create a flood cleanup dispatch app',
    'I need a restoration company management system',
    'Build a water mitigation tracking app',
    'Create an emergency restoration platform',
  ],
};
