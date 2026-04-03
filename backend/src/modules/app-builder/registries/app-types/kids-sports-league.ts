/**
 * Kids Sports League App Type Definition
 *
 * Complete definition for youth sports leagues and kids athletics.
 * Essential for youth leagues, recreational sports, and kids athletic programs.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const KIDS_SPORTS_LEAGUE_APP_TYPE: AppTypeDefinition = {
  id: 'kids-sports-league',
  name: 'Kids Sports League',
  category: 'children',
  description: 'Kids sports league platform with team registration, game scheduling, score tracking, and coach management',
  icon: 'trophy',

  keywords: [
    'kids sports league',
    'youth league',
    'kids sports software',
    'youth athletics',
    'sports registration',
    'league management',
    'recreational sports',
    'kids teams',
    'game scheduling',
    'youth soccer',
    'league crm',
    'youth basketball',
    'league business',
    'kids baseball',
    'league pos',
    'youth football',
    'league operations',
    'sports seasons',
    'league services',
    'kids swimming',
  ],

  synonyms: [
    'kids sports league platform',
    'kids sports league software',
    'youth league software',
    'youth athletics software',
    'sports registration software',
    'league management software',
    'recreational sports software',
    'kids team software',
    'youth sports software',
    'sports scheduling software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'professional sports'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Registration and schedules' },
    { id: 'admin', name: 'League Dashboard', enabled: true, basePath: '/admin', requiredRole: 'coach', layout: 'admin', description: 'Teams and games' },
  ],

  roles: [
    { id: 'admin', name: 'Commissioner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'League Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/seasons' },
    { id: 'coach', name: 'Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/team' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'group-training',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'trainer-booking',
    'fitness-challenges',
    'equipment-booking',
    'class-packages',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'sporty',

  examplePrompts: [
    'Build a youth sports league platform',
    'Create a kids athletic registration app',
    'I need a recreational sports league system',
    'Build a youth soccer league app',
    'Create a kids team management platform',
  ],
};
