/**
 * Fire Safety App Type Definition
 *
 * Complete definition for fire safety and fire protection applications.
 * Essential for fire safety companies, fire protection services, and fire inspectors.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_SAFETY_APP_TYPE: AppTypeDefinition = {
  id: 'fire-safety',
  name: 'Fire Safety',
  category: 'security',
  description: 'Fire safety platform with inspection scheduling, compliance tracking, equipment management, and reporting',
  icon: 'fire',

  keywords: [
    'fire safety',
    'fire protection',
    'fire inspection',
    'fire safety software',
    'fire extinguisher',
    'fire alarm testing',
    'fire compliance',
    'fire sprinkler',
    'fire suppression',
    'fire safety inspection',
    'fire equipment',
    'fire safety company',
    'fire code compliance',
    'fire prevention',
    'fire safety business',
    'fire system',
    'fire safety service',
    'fire safety management',
    'fire risk assessment',
    'fire safety testing',
  ],

  synonyms: [
    'fire safety platform',
    'fire safety software',
    'fire protection software',
    'fire inspection software',
    'fire compliance software',
    'fire equipment software',
    'fire safety management software',
    'fire alarm software',
    'fire sprinkler software',
    'fire prevention software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'fire department'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and scheduling' },
    { id: 'admin', name: 'Fire Safety Dashboard', enabled: true, basePath: '/admin', requiredRole: 'inspector', layout: 'admin', description: 'Inspections and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'inspector', name: 'Fire Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'technician', name: 'Technician', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/service' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'inventory',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'security',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fire safety inspection platform',
    'Create a fire protection service app',
    'I need a fire compliance tracking system',
    'Build a fire equipment management app',
    'Create a fire safety business platform',
  ],
};
