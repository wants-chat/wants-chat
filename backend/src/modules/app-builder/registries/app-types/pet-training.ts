/**
 * Pet Training App Type Definition
 *
 * Complete definition for pet training operations.
 * Essential for dog trainers, obedience schools, and animal behaviorists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'pet-training',
  name: 'Pet Training',
  category: 'services',
  description: 'Pet training platform with class scheduling, progress tracking, training plans, and client management',
  icon: 'dog',

  keywords: [
    'pet training',
    'dog training',
    'pet training software',
    'obedience school',
    'animal behavior',
    'pet training management',
    'class scheduling',
    'pet training practice',
    'pet training scheduling',
    'progress tracking',
    'pet training crm',
    'training plans',
    'pet training business',
    'client management',
    'pet training pos',
    'puppy classes',
    'pet training operations',
    'agility training',
    'pet training platform',
    'behavioral modification',
  ],

  synonyms: [
    'pet training platform',
    'pet training software',
    'dog training software',
    'obedience school software',
    'animal behavior software',
    'class scheduling software',
    'pet training practice software',
    'progress tracking software',
    'training plans software',
    'agility training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and progress' },
    { id: 'admin', name: 'Trainer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Clients and training' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'trainer', name: 'Head Trainer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Training Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Pet Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'analytics',
    'clients',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet training platform',
    'Create a dog training portal',
    'I need a pet training management system',
    'Build a class scheduling platform',
    'Create a progress tracking and training app',
  ],
};
