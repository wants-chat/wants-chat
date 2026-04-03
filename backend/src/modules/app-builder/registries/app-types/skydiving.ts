/**
 * Skydiving App Type Definition
 *
 * Complete definition for skydiving center operations.
 * Essential for drop zones, tandem jumps, and skydiving instruction.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SKYDIVING_APP_TYPE: AppTypeDefinition = {
  id: 'skydiving',
  name: 'Skydiving',
  category: 'outdoor',
  description: 'Skydiving platform with jump booking, manifest management, weather tracking, and training programs',
  icon: 'plane',

  keywords: [
    'skydiving',
    'drop zone',
    'skydiving software',
    'tandem jumps',
    'parachuting',
    'skydiving management',
    'jump booking',
    'skydiving practice',
    'skydiving scheduling',
    'manifest management',
    'skydiving crm',
    'weather tracking',
    'skydiving business',
    'training programs',
    'skydiving pos',
    'aff course',
    'skydiving operations',
    'license progression',
    'skydiving platform',
    'experienced jumpers',
  ],

  synonyms: [
    'skydiving platform',
    'skydiving software',
    'drop zone software',
    'tandem jumps software',
    'parachuting software',
    'jump booking software',
    'skydiving practice software',
    'manifest management software',
    'weather tracking software',
    'license progression software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Jumper Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jumps and training' },
    { id: 'admin', name: 'DZ Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Manifest and operations' },
  ],

  roles: [
    { id: 'admin', name: 'DZ Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'DZ Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/manifest' },
    { id: 'instructor', name: 'Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/students' },
    { id: 'jumper', name: 'Jumper', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'outdoor',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'adventure',

  examplePrompts: [
    'Build a skydiving center platform',
    'Create a drop zone management portal',
    'I need a tandem booking system',
    'Build a manifest and weather platform',
    'Create a jump booking and training app',
  ],
};
