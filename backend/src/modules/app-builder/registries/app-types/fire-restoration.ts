/**
 * Fire Restoration App Type Definition
 *
 * Complete definition for fire and smoke damage restoration applications.
 * Essential for fire restoration companies, smoke damage specialists, and disaster recovery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FIRE_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'fire-restoration',
  name: 'Fire Restoration',
  category: 'cleaning',
  description: 'Fire restoration platform with damage assessment, content inventory, smoke remediation tracking, and insurance coordination',
  icon: 'flame',

  keywords: [
    'fire restoration',
    'smoke damage',
    'fire damage',
    'restoration software',
    'fire cleanup',
    'restoration booking',
    'smoke remediation',
    'fire damage repair',
    'restoration scheduling',
    'soot removal',
    'restoration crm',
    'content restoration',
    'restoration business',
    'fire recovery',
    'restoration pos',
    'odor removal',
    'restoration management',
    'board-up services',
    'restoration services',
    'disaster recovery',
  ],

  synonyms: [
    'fire restoration platform',
    'fire restoration software',
    'smoke damage software',
    'fire damage software',
    'fire cleanup software',
    'smoke remediation software',
    'fire recovery software',
    'restoration scheduling software',
    'fire restoration management software',
    'disaster recovery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'fire department'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Emergency requests' },
    { id: 'admin', name: 'Restoration Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Projects and inventory' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'technician', name: 'Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'team-management',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'cleaning',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a fire restoration platform',
    'Create a smoke damage cleanup app',
    'I need a fire damage restoration system',
    'Build a content restoration tracking app',
    'Create a fire recovery management platform',
  ],
};
