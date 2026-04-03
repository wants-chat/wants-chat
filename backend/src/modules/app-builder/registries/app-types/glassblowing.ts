/**
 * Glassblowing App Type Definition
 *
 * Complete definition for glassblowing studios and glass art workshops.
 * Essential for glassblowing studios, hot glass shops, and glass art schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GLASSBLOWING_APP_TYPE: AppTypeDefinition = {
  id: 'glassblowing',
  name: 'Glassblowing Studio',
  category: 'creative',
  description: 'Glassblowing studio platform with furnace scheduling, class bookings, equipment management, and artist residencies',
  icon: 'flame',

  keywords: [
    'glassblowing',
    'hot glass',
    'glassblowing software',
    'glass art',
    'glass studio',
    'glassblowing management',
    'furnace scheduling',
    'glassblowing practice',
    'glassblowing scheduling',
    'glass classes',
    'glassblowing crm',
    'blown glass',
    'glassblowing business',
    'lampworking',
    'glassblowing pos',
    'glass workshops',
    'glassblowing operations',
    'fused glass',
    'glassblowing services',
    'glass artisan',
  ],

  synonyms: [
    'glassblowing platform',
    'glassblowing software',
    'hot glass software',
    'glass art software',
    'glass studio software',
    'furnace scheduling software',
    'glassblowing practice software',
    'glass classes software',
    'blown glass software',
    'glass artisan software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Artist Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and studio' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Equipment and artists' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'master', name: 'Master Glassblower', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'technician', name: 'Furnace Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/equipment' },
    { id: 'artist', name: 'Glass Artist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'creative',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a glassblowing studio platform',
    'Create a hot glass workshop portal',
    'I need a glass studio management system',
    'Build a glass art school platform',
    'Create a glassblowing class and furnace booking app',
  ],
};
