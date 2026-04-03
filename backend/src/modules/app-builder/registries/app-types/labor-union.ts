/**
 * Labor Union App Type Definition
 *
 * Complete definition for labor union and worker organization applications.
 * Essential for labor unions, trade unions, and worker advocacy organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LABOR_UNION_APP_TYPE: AppTypeDefinition = {
  id: 'labor-union',
  name: 'Labor Union',
  category: 'community',
  description: 'Labor union platform with member management, dues collection, grievance tracking, and contract negotiations',
  icon: 'users',

  keywords: [
    'labor union',
    'trade union',
    'union management',
    'union membership',
    'union dues',
    'collective bargaining',
    'grievance',
    'union local',
    'worker organization',
    'union hall',
    'labor organization',
    'union contract',
    'union elections',
    'shop steward',
    'union benefits',
    'worker advocacy',
    'organizing',
    'union meeting',
    'labor rights',
    'union newsletter',
    'member portal',
  ],

  synonyms: [
    'labor union platform',
    'union management software',
    'trade union software',
    'union membership software',
    'labor organization software',
    'union portal',
    'union app',
    'collective bargaining software',
    'union dues management',
    'worker organization platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Member Portal', enabled: true, basePath: '/', layout: 'public', description: 'Access benefits and news' },
    { id: 'admin', name: 'Union Dashboard', enabled: true, basePath: '/admin', requiredRole: 'officer', layout: 'admin', description: 'Members and grievances' },
  ],

  roles: [
    { id: 'admin', name: 'Union President', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'officer', name: 'Union Officer', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/members' },
    { id: 'rep', name: 'Business Rep', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/grievances' },
    { id: 'steward', name: 'Shop Steward', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/worksite' },
    { id: 'staff', name: 'Office Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dues' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'community',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a labor union management platform',
    'Create a union member portal',
    'I need a trade union dues system',
    'Build a union with grievance tracking',
    'Create a labor organization app',
  ],
};
