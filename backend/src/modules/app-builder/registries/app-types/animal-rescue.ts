/**
 * Animal Rescue App Type Definition
 *
 * Complete definition for animal rescue operations.
 * Essential for animal rescues, shelters, and wildlife rehabilitation centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_RESCUE_APP_TYPE: AppTypeDefinition = {
  id: 'animal-rescue',
  name: 'Animal Rescue',
  category: 'nonprofit',
  description: 'Animal rescue platform with adoption management, foster coordination, volunteer scheduling, and donation tracking',
  icon: 'heart',

  keywords: [
    'animal rescue',
    'animal shelter',
    'animal rescue software',
    'pet adoption',
    'wildlife rescue',
    'animal rescue management',
    'adoption management',
    'animal rescue practice',
    'animal rescue scheduling',
    'foster coordination',
    'animal rescue crm',
    'volunteer scheduling',
    'animal rescue business',
    'donation tracking',
    'animal rescue pos',
    'pet rehoming',
    'animal rescue operations',
    'rescue transport',
    'animal rescue platform',
    'spay neuter',
  ],

  synonyms: [
    'animal rescue platform',
    'animal rescue software',
    'animal shelter software',
    'pet adoption software',
    'wildlife rescue software',
    'adoption management software',
    'animal rescue practice software',
    'foster coordination software',
    'volunteer scheduling software',
    'pet rehoming software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Adoption Portal', enabled: true, basePath: '/', layout: 'public', description: 'Adoptable pets' },
    { id: 'admin', name: 'Rescue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Animals and fosters' },
  ],

  roles: [
    { id: 'admin', name: 'Rescue Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Foster Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/fosters' },
    { id: 'volunteer', name: 'Volunteer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/animals' },
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
    'feedback',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'nonprofit',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build an animal rescue platform',
    'Create an animal shelter app',
    'I need a pet adoption system',
    'Build a wildlife rescue management app',
    'Create an animal rescue portal',
  ],
};
