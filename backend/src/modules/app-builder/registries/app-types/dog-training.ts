/**
 * Dog Training App Type Definition
 *
 * Complete definition for dog training and pet training applications.
 * Essential for dog trainers, puppy schools, and behavior specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOG_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'dog-training',
  name: 'Dog Training',
  category: 'pets',
  description: 'Dog training platform with class scheduling, progress tracking, homework assignments, and trainer management',
  icon: 'graduation-cap',

  keywords: [
    'dog training',
    'pet training',
    'dog trainer',
    'training software',
    'puppy classes',
    'training booking',
    'obedience training',
    'training scheduling',
    'behavior training',
    'training crm',
    'puppy school',
    'training management',
    'dog training business',
    'training pos',
    'board and train',
    'agility training',
    'training progress',
    'private lessons',
    'group classes',
    'training facility',
  ],

  synonyms: [
    'dog training platform',
    'dog training software',
    'pet training software',
    'training booking software',
    'puppy class software',
    'obedience training software',
    'training scheduling software',
    'trainer management software',
    'dog training management software',
    'behavior training software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'personal trainer'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and progress' },
    { id: 'admin', name: 'Training Dashboard', enabled: true, basePath: '/admin', requiredRole: 'trainer', layout: 'admin', description: 'Dogs and classes' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Training Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'trainer', name: 'Trainer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'analytics',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reminders',
    'reporting',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a dog training class platform',
    'Create a puppy school management app',
    'I need a dog trainer scheduling system',
    'Build a pet training progress app',
    'Create a board and train management platform',
  ],
};
