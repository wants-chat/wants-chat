/**
 * Livestock App Type Definition
 *
 * Complete definition for livestock management and ranching applications.
 * Essential for cattle ranches, dairy farms, and livestock operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LIVESTOCK_APP_TYPE: AppTypeDefinition = {
  id: 'livestock',
  name: 'Livestock',
  category: 'agriculture',
  description: 'Livestock management platform with herd tracking, health records, breeding management, and inventory',
  icon: 'cow',

  keywords: [
    'livestock management',
    'cattle management',
    'herd management',
    'ranching software',
    'dairy management',
    'livestock tracking',
    'cattle tracking',
    'breeding records',
    'livestock health',
    'animal management',
    'ranch management',
    'poultry management',
    'swine management',
    'sheep management',
    'livestock inventory',
    'vet records',
    'livestock sales',
    'feedlot management',
    'grazing management',
    'livestock software',
  ],

  synonyms: [
    'livestock management platform',
    'livestock management software',
    'cattle management software',
    'herd management software',
    'ranch management software',
    'dairy management software',
    'livestock tracking software',
    'animal management software',
    'livestock record keeping',
    'ranch operations platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'pet management'],

  sections: [
    { id: 'frontend', name: 'Ranch Portal', enabled: true, basePath: '/', layout: 'public', description: 'Herd overview and reports' },
    { id: 'admin', name: 'Livestock Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Herd and health management' },
  ],

  roles: [
    { id: 'admin', name: 'Ranch Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Ranch Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/herd' },
    { id: 'vet', name: 'Veterinarian', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/health' },
    { id: 'handler', name: 'Animal Handler', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/daily' },
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

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a livestock management platform',
    'Create a cattle tracking app',
    'I need a herd management system',
    'Build a dairy farm management app',
    'Create a ranch operations platform',
  ],
};
