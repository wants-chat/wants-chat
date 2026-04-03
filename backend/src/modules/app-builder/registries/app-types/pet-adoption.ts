/**
 * Pet Adoption App Type Definition
 *
 * Complete definition for pet adoption and animal rescue applications.
 * Essential for animal shelters, rescue organizations, and adoption centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_ADOPTION_APP_TYPE: AppTypeDefinition = {
  id: 'pet-adoption',
  name: 'Pet Adoption',
  category: 'pets',
  description: 'Pet adoption platform with animal profiles, adoption applications, foster management, and donation processing',
  icon: 'heart',

  keywords: [
    'pet adoption',
    'animal shelter',
    'pet rescue',
    'adoption software',
    'animal rescue',
    'adoption applications',
    'shelter management',
    'foster management',
    'pet matching',
    'adoption crm',
    'rescue organization',
    'animal adoption',
    'adoption center',
    'pet rehoming',
    'adoption events',
    'shelter operations',
    'pet profiles',
    'adoption donations',
    'rescue software',
    'adoption platform',
  ],

  synonyms: [
    'pet adoption platform',
    'pet adoption software',
    'animal shelter software',
    'rescue organization software',
    'adoption application software',
    'shelter management software',
    'foster management software',
    'animal rescue software',
    'adoption center software',
    'pet rehoming software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'child adoption'],

  sections: [
    { id: 'frontend', name: 'Adopter Portal', enabled: true, basePath: '/', layout: 'public', description: 'Animals and applications' },
    { id: 'admin', name: 'Shelter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Animals and fosters' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shelter Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/animals' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/applications' },
    { id: 'foster', name: 'Foster', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/fosters' },
    { id: 'adopter', name: 'Adopter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'property-listings', 'product-catalog'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet adoption platform',
    'Create an animal shelter management app',
    'I need a rescue organization system',
    'Build a foster management app',
    'Create a pet matching platform',
  ],
};
