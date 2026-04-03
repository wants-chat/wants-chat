/**
 * Bungee Jumping App Type Definition
 *
 * Complete definition for bungee jumping and extreme adventure operations.
 * Essential for bungee jump sites, extreme sports operators, and adventure parks.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUNGEE_JUMPING_APP_TYPE: AppTypeDefinition = {
  id: 'bungee-jumping',
  name: 'Bungee Jumping',
  category: 'entertainment',
  description: 'Bungee jumping platform with jump booking, safety equipment tracking, waiver management, and photo/video packages',
  icon: 'arrow-down',

  keywords: [
    'bungee jumping',
    'extreme sports',
    'bungee jumping software',
    'adventure park',
    'thrill seeking',
    'bungee jumping management',
    'jump booking',
    'bungee jumping practice',
    'bungee jumping scheduling',
    'safety equipment',
    'bungee jumping crm',
    'waiver management',
    'bungee jumping business',
    'photo video',
    'bungee jumping pos',
    'bridge jump',
    'bungee jumping operations',
    'tower jump',
    'bungee jumping platform',
    'tandem jump',
  ],

  synonyms: [
    'bungee jumping platform',
    'bungee jumping software',
    'extreme sports software',
    'adventure park software',
    'thrill seeking software',
    'jump booking software',
    'bungee jumping practice software',
    'safety equipment software',
    'waiver management software',
    'bridge jump software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Jumps and booking' },
    { id: 'admin', name: 'Site Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Safety and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Site Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'jumpmaster', name: 'Jump Master', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jumps' },
    { id: 'staff', name: 'Safety Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'customer', name: 'Jumper', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'extreme',

  examplePrompts: [
    'Build a bungee jumping platform',
    'Create an extreme sports portal',
    'I need an adventure booking system',
    'Build a jump site management platform',
    'Create a bungee experience app',
  ],
};
