/**
 * Boat Repair App Type Definition
 *
 * Complete definition for boat repair and marine service shops.
 * Essential for boat mechanics, marine repair, and watercraft maintenance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOAT_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'boat-repair',
  name: 'Boat Repair',
  category: 'marine',
  description: 'Boat repair platform with work order management, haul-out scheduling, parts inventory, and winterization tracking',
  icon: 'wrench',

  keywords: [
    'boat repair',
    'marine service',
    'boat repair software',
    'boat mechanic',
    'marine repair',
    'boat repair management',
    'outboard service',
    'boat maintenance',
    'boat repair scheduling',
    'inboard service',
    'boat repair crm',
    'engine repair',
    'boat repair business',
    'fiberglass repair',
    'boat repair pos',
    'winterization',
    'boat repair operations',
    'hull repair',
    'boat repair services',
    'marine mechanics',
  ],

  synonyms: [
    'boat repair platform',
    'boat repair software',
    'marine service software',
    'boat mechanic software',
    'marine repair software',
    'outboard service software',
    'boat maintenance software',
    'inboard service software',
    'fiberglass repair software',
    'marine mechanics software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'auto repair'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Services and status' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'technician', layout: 'admin', description: 'Work orders and parts' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Service Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/work-orders' },
    { id: 'technician', name: 'Marine Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Boat Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'inventory',
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

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marine',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'nautical',

  examplePrompts: [
    'Build a boat repair shop platform',
    'Create a marine service management app',
    'I need a boat maintenance scheduling system',
    'Build a marine repair work order platform',
    'Create a boat mechanic shop app',
  ],
};
