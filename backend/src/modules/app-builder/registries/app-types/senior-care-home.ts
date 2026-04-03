/**
 * Senior Care Home App Type Definition
 *
 * Complete definition for senior living facility operations.
 * Essential for assisted living facilities, nursing homes, and senior communities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_CARE_HOME_APP_TYPE: AppTypeDefinition = {
  id: 'senior-care-home',
  name: 'Senior Care Home',
  category: 'healthcare',
  description: 'Senior care home platform with resident management, care planning, activity scheduling, and family portal',
  icon: 'heart-handshake',

  keywords: [
    'senior care home',
    'assisted living',
    'senior care home software',
    'nursing home',
    'senior community',
    'senior care home management',
    'resident management',
    'senior care home practice',
    'senior care home scheduling',
    'care planning',
    'senior care home crm',
    'activity scheduling',
    'senior care home business',
    'family portal',
    'senior care home pos',
    'memory care',
    'senior care home operations',
    'elder care',
    'senior care home platform',
    'retirement living',
  ],

  synonyms: [
    'senior care home platform',
    'senior care home software',
    'assisted living software',
    'nursing home software',
    'senior community software',
    'resident management software',
    'senior care home practice software',
    'care planning software',
    'activity scheduling software',
    'memory care software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'veterinary'],

  sections: [
    { id: 'frontend', name: 'Family Portal', enabled: true, basePath: '/', layout: 'public', description: 'Updates and visits' },
    { id: 'admin', name: 'Care Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Residents and care' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'nurse', name: 'Nurse Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/care' },
    { id: 'caregiver', name: 'Caregiver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/residents' },
    { id: 'family', name: 'Family Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'veterinary-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'warm',

  examplePrompts: [
    'Build a senior care home platform',
    'Create an assisted living management app',
    'I need a nursing home resident system',
    'Build a senior community portal',
    'Create an elder care facility app',
  ],
};
