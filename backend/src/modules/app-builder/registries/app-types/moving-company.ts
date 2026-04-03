/**
 * Moving Company App Type Definition
 *
 * Complete definition for moving and relocation service applications.
 * Essential for moving companies, relocation services, and movers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOVING_COMPANY_APP_TYPE: AppTypeDefinition = {
  id: 'moving-company',
  name: 'Moving Company',
  category: 'logistics',
  description: 'Moving company platform with quote management, job scheduling, crew dispatch, and inventory tracking',
  icon: 'home',

  keywords: [
    'moving company',
    'movers',
    'relocation service',
    'moving service',
    'household moving',
    'office moving',
    'commercial moving',
    'moving quotes',
    'moving software',
    'moving booking',
    'local movers',
    'long distance moving',
    'packing services',
    'storage moving',
    'moving estimate',
    'moving truck',
    'furniture moving',
    'moving crew',
    'relocation management',
    'moving logistics',
  ],

  synonyms: [
    'moving company platform',
    'moving company software',
    'movers management software',
    'relocation service software',
    'moving booking platform',
    'moving quote software',
    'moving operations software',
    'moving crew management',
    'moving service platform',
    'relocation management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness', 'exercise movement'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Get quotes and book moves' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Jobs and crew scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/jobs' },
    { id: 'dispatcher', name: 'Dispatcher', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'foreman', name: 'Crew Foreman', level: 50, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/crew' },
    { id: 'mover', name: 'Mover', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'inventory',
    'calendar',
    'notifications',
    'search',
    'route-optimization',
    'fleet-tracking',
  ],

  optionalFeatures: [
    'payments',
    'crm',
    'reviews',
    'analytics',
    'shipment-tracking',
    'proof-of-delivery',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'logistics',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a moving company platform',
    'Create a movers booking app',
    'I need a moving quote system',
    'Build a relocation service app',
    'Create a moving crew management system',
  ],
};
