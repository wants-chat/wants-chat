/**
 * Access Control App Type Definition
 *
 * Complete definition for access control and credential management applications.
 * Essential for access control companies, security integrators, and facility managers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ACCESS_CONTROL_APP_TYPE: AppTypeDefinition = {
  id: 'access-control',
  name: 'Access Control',
  category: 'security',
  description: 'Access control platform with credential management, door control, visitor management, and audit reporting',
  icon: 'key',

  keywords: [
    'access control',
    'credential management',
    'access control software',
    'door access',
    'keycard system',
    'access management',
    'badge system',
    'access credentials',
    'access permissions',
    'access control system',
    'entry control',
    'security access',
    'access audit',
    'visitor access',
    'access scheduling',
    'access zones',
    'access levels',
    'access control business',
    'biometric access',
    'card access',
  ],

  synonyms: [
    'access control platform',
    'access control software',
    'credential management software',
    'door control software',
    'keycard software',
    'badge management software',
    'entry control software',
    'access management software',
    'visitor access software',
    'security access software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'website access'],

  sections: [
    { id: 'frontend', name: 'User Portal', enabled: true, basePath: '/', layout: 'public', description: 'Access and requests' },
    { id: 'admin', name: 'Access Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Credentials and doors' },
  ],

  roles: [
    { id: 'admin', name: 'System Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Security Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/credentials' },
    { id: 'operator', name: 'Access Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/doors' },
    { id: 'receptionist', name: 'Receptionist', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/visitors' },
    { id: 'user', name: 'User', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'security',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an access control platform',
    'Create a credential management app',
    'I need a door access system',
    'Build a visitor management app',
    'Create an access control dashboard',
  ],
};
