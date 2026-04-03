/**
 * Commercial Cleaning App Type Definition
 *
 * Complete definition for commercial cleaning and office cleaning applications.
 * Essential for commercial cleaning companies, janitorial services, and facility maintenance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-cleaning',
  name: 'Commercial Cleaning',
  category: 'cleaning',
  description: 'Commercial cleaning platform with contract management, crew scheduling, quality inspections, and client portal',
  icon: 'building',

  keywords: [
    'commercial cleaning',
    'office cleaning',
    'commercial cleaner',
    'cleaning software',
    'janitorial services',
    'cleaning contracts',
    'business cleaning',
    'facility cleaning',
    'cleaning scheduling',
    'commercial cleaning crm',
    'cleaning crew',
    'cleaning management',
    'cleaning business',
    'building cleaning',
    'cleaning pos',
    'night cleaning',
    'cleaning operations',
    'quality inspections',
    'cleaning services',
    'facility maintenance',
  ],

  synonyms: [
    'commercial cleaning platform',
    'commercial cleaning software',
    'office cleaning software',
    'janitorial software',
    'commercial cleaner software',
    'facility cleaning software',
    'cleaning contract software',
    'cleaning scheduling software',
    'commercial cleaning management software',
    'cleaning crew software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'residential cleaning'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and requests' },
    { id: 'admin', name: 'Cleaning Dashboard', enabled: true, basePath: '/admin', requiredRole: 'crew', layout: 'admin', description: 'Schedule and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/contracts' },
    { id: 'supervisor', name: 'Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'contracts',
    'dashboard',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'time-tracking',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'cleaning',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a commercial cleaning platform',
    'Create an office cleaning management app',
    'I need a janitorial services scheduling system',
    'Build a cleaning crew management app',
    'Create a facility cleaning platform',
  ],
};
