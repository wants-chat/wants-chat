/**
 * Animal Shelter App Type Definition
 *
 * Complete definition for animal shelter operations.
 * Essential for animal shelters, rescue organizations, and adoption centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_SHELTER_APP_TYPE: AppTypeDefinition = {
  id: 'animal-shelter',
  name: 'Animal Shelter',
  category: 'community',
  description: 'Animal shelter platform with pet profiles, adoption applications, foster management, and veterinary tracking',
  icon: 'paw-print',

  keywords: [
    'animal shelter',
    'rescue organization',
    'animal shelter software',
    'adoption center',
    'pet adoption',
    'animal shelter management',
    'pet profiles',
    'animal shelter practice',
    'animal shelter scheduling',
    'adoption applications',
    'animal shelter crm',
    'foster management',
    'animal shelter business',
    'veterinary tracking',
    'animal shelter pos',
    'intake processing',
    'animal shelter operations',
    'spay neuter',
    'animal shelter platform',
    'volunteer coordination',
  ],

  synonyms: [
    'animal shelter platform',
    'animal shelter software',
    'rescue organization software',
    'adoption center software',
    'pet adoption software',
    'pet profiles software',
    'animal shelter practice software',
    'adoption applications software',
    'foster management software',
    'volunteer coordination software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'automotive', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Adoption Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pets and adoption' },
    { id: 'admin', name: 'Shelter Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Animals and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Shelter Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Adoption Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/adoptions' },
    { id: 'staff', name: 'Animal Care Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/animals' },
    { id: 'adopter', name: 'Adopter', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build an animal shelter management platform',
    'Create a pet adoption portal',
    'I need a rescue organization system',
    'Build an adoption application platform',
    'Create a foster and veterinary tracking app',
  ],
};
