/**
 * Post Construction Cleaning App Type Definition
 *
 * Complete definition for post-construction and builder cleaning applications.
 * Essential for construction cleaning companies, builder cleaning services, and final clean specialists.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POST_CONSTRUCTION_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'post-construction-cleaning',
  name: 'Post Construction Cleaning',
  category: 'cleaning',
  description: 'Post-construction cleaning platform with phase scheduling, punch list tracking, builder contracts, and crew management',
  icon: 'hard-hat',

  keywords: [
    'post construction cleaning',
    'builder cleaning',
    'construction cleanup',
    'cleaning software',
    'final clean',
    'construction cleaning booking',
    'rough clean',
    'builder clean',
    'construction cleaning scheduling',
    'punch list',
    'cleaning crm',
    'new construction cleaning',
    'cleaning business',
    'phase cleaning',
    'cleaning pos',
    'builder contracts',
    'cleaning management',
    'window cleaning',
    'cleaning services',
    'debris cleanup',
  ],

  synonyms: [
    'post construction cleaning platform',
    'post construction cleaning software',
    'builder cleaning software',
    'construction cleanup software',
    'final clean software',
    'rough clean software',
    'construction cleaning scheduling software',
    'builder clean software',
    'construction cleaning management software',
    'new construction cleaning software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'construction management'],

  sections: [
    { id: 'frontend', name: 'Builder Portal', enabled: true, basePath: '/', layout: 'public', description: 'Scheduling and punch lists' },
    { id: 'admin', name: 'Cleaning Dashboard', enabled: true, basePath: '/admin', requiredRole: 'crew', layout: 'admin', description: 'Projects and crews' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'supervisor', name: 'Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sites' },
    { id: 'crew', name: 'Crew Member', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'builder', name: 'Builder', level: 35, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'time-tracking',
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'cleaning',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a post-construction cleaning platform',
    'Create a builder cleaning scheduling app',
    'I need a construction cleanup management system',
    'Build a final clean tracking app',
    'Create a builder cleaning contracts platform',
  ],
};
