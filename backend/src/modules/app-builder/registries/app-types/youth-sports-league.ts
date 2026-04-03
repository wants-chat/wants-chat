/**
 * Youth Sports League App Type Definition
 *
 * Complete definition for youth sports league operations.
 * Essential for youth leagues, rec sports, and community athletics.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOUTH_SPORTS_LEAGUE_APP_TYPE: AppTypeDefinition = {
  id: 'youth-sports-league',
  name: 'Youth Sports League',
  category: 'sports',
  description: 'Youth sports league platform with team registration, game scheduling, standings tracking, and parent communication',
  icon: 'trophy',

  keywords: [
    'youth sports league',
    'rec sports',
    'youth sports league software',
    'community athletics',
    'youth baseball',
    'youth sports league management',
    'team registration',
    'youth sports league practice',
    'youth sports league scheduling',
    'game scheduling',
    'youth sports league crm',
    'standings tracking',
    'youth sports league business',
    'parent communication',
    'youth sports league pos',
    'youth soccer',
    'youth sports league operations',
    'youth basketball',
    'youth sports league platform',
    'youth football',
  ],

  synonyms: [
    'youth sports league platform',
    'youth sports league software',
    'rec sports software',
    'community athletics software',
    'youth baseball software',
    'team registration software',
    'youth sports league practice software',
    'game scheduling software',
    'standings tracking software',
    'youth soccer software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Teams and schedules' },
    { id: 'admin', name: 'League Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Games and standings' },
  ],

  roles: [
    { id: 'admin', name: 'League Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'commissioner', name: 'Commissioner', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'coach', name: 'Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/team' },
    { id: 'parent', name: 'Parent/Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'workout-tracking',
    'class-packages',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a youth sports league platform',
    'Create a rec sports management app',
    'I need a youth baseball league system',
    'Build a community athletics platform',
    'Create a youth soccer league app',
  ],
};
