/**
 * Fire Safety Inspection App Type Definition
 *
 * Complete definition for fire safety inspection service operations.
 * Essential for fire inspection companies, fire safety consultants, and compliance services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_SAFETY_INSPECTION_APP_TYPE: AppTypeDefinition = {
  id: 'fire-safety-inspection',
  name: 'Fire Safety Inspection',
  category: 'services',
  description: 'Fire safety platform with inspection scheduling, compliance tracking, deficiency management, and certificate issuance',
  icon: 'flame',

  keywords: [
    'fire safety inspection',
    'fire inspection',
    'fire safety inspection software',
    'fire safety consultant',
    'compliance inspection',
    'fire safety inspection management',
    'inspection scheduling',
    'fire safety inspection practice',
    'fire safety inspection scheduling',
    'compliance tracking',
    'fire safety inspection crm',
    'deficiency management',
    'fire safety inspection business',
    'certificate issuance',
    'fire safety inspection pos',
    'fire extinguisher inspection',
    'fire safety inspection operations',
    'sprinkler inspection',
    'fire safety inspection platform',
    'fire alarm testing',
  ],

  synonyms: [
    'fire safety inspection platform',
    'fire safety inspection software',
    'fire inspection software',
    'fire safety consultant software',
    'compliance inspection software',
    'inspection scheduling software',
    'fire safety inspection practice software',
    'compliance tracking software',
    'deficiency management software',
    'fire extinguisher inspection software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Inspections and compliance' },
    { id: 'admin', name: 'Inspector Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inspections and certificates' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Lead Inspector', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inspections' },
    { id: 'inspector', name: 'Fire Inspector', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Building Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fire safety inspection platform',
    'Create a fire inspection service app',
    'I need a fire safety compliance system',
    'Build a fire safety consultant app',
    'Create a fire safety inspection portal',
  ],
};
