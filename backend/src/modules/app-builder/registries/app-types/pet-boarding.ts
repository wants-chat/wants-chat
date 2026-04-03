/**
 * Pet Boarding App Type Definition
 *
 * Complete definition for pet boarding and kennel applications.
 * Essential for pet boarding facilities, kennels, and catteries.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_BOARDING_APP_TYPE: AppTypeDefinition = {
  id: 'pet-boarding',
  name: 'Pet Boarding',
  category: 'pets',
  description: 'Pet boarding platform with reservation booking, kennel management, feeding schedules, and pet activity updates',
  icon: 'home',

  keywords: [
    'pet boarding',
    'dog boarding',
    'kennel software',
    'pet hotel',
    'boarding booking',
    'cattery',
    'pet resort',
    'boarding reservations',
    'dog kennel',
    'boarding scheduling',
    'pet lodging',
    'boarding crm',
    'boarding business',
    'overnight boarding',
    'boarding pos',
    'boarding management',
    'pet daycare boarding',
    'boarding facility',
    'pet accommodation',
    'boarding operations',
  ],

  synonyms: [
    'pet boarding platform',
    'pet boarding software',
    'kennel software',
    'pet hotel software',
    'boarding reservation software',
    'cattery software',
    'pet resort software',
    'boarding management software',
    'dog boarding software',
    'boarding scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'airplane boarding'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reservations and updates' },
    { id: 'admin', name: 'Boarding Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Kennels and pets' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Facility Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/reservations' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/kennels' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reminders',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a pet boarding reservation platform',
    'Create a dog kennel management app',
    'I need a pet hotel booking system',
    'Build a cattery management app',
    'Create a pet resort platform',
  ],
};
