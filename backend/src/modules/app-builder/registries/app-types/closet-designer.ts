/**
 * Closet Designer App Type Definition
 *
 * Complete definition for closet design and installation operations.
 * Essential for closet designers, organization specialists, and custom storage companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLOSET_DESIGNER_APP_TYPE: AppTypeDefinition = {
  id: 'closet-designer',
  name: 'Closet Designer',
  category: 'services',
  description: 'Closet designer platform with design consultation, 3D visualization, installation scheduling, and accessory selection',
  icon: 'closet',

  keywords: [
    'closet designer',
    'organization specialist',
    'closet designer software',
    'custom storage',
    'walk in closet',
    'closet designer management',
    'design consultation',
    'closet designer practice',
    'closet designer scheduling',
    '3d visualization',
    'closet designer crm',
    'installation scheduling',
    'closet designer business',
    'accessory selection',
    'closet designer pos',
    'garage storage',
    'closet designer operations',
    'pantry organization',
    'closet designer platform',
    'murphy bed',
  ],

  synonyms: [
    'closet designer platform',
    'closet designer software',
    'organization specialist software',
    'custom storage software',
    'walk in closet software',
    'design consultation software',
    'closet designer practice software',
    '3d visualization software',
    'installation scheduling software',
    'garage storage software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Designs and quotes' },
    { id: 'admin', name: 'Designer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Design Consultant', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/consultations' },
    { id: 'installer', name: 'Installer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
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
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a closet designer platform',
    'Create a custom closet company app',
    'I need a storage organization system',
    'Build a closet design business app',
    'Create a closet installation portal',
  ],
};
