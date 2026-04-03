/**
 * Vehicle Inspection App Type Definition
 *
 * Complete definition for vehicle inspection and testing applications.
 * Essential for inspection stations, emissions testing, and safety inspections.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEHICLE_INSPECTION_APP_TYPE: AppTypeDefinition = {
  id: 'vehicle-inspection',
  name: 'Vehicle Inspection',
  category: 'automotive',
  description: 'Vehicle inspection platform with scheduling, digital inspections, compliance tracking, and certificate management',
  icon: 'clipboard-check',

  keywords: [
    'vehicle inspection',
    'car inspection',
    'inspection station',
    'vehicle inspection software',
    'emissions testing',
    'safety inspection',
    'state inspection',
    'mot inspection',
    'vehicle testing',
    'inspection scheduling',
    'inspection forms',
    'inspection certificates',
    'vehicle compliance',
    'inspection business',
    'pre-purchase inspection',
    'fleet inspection',
    'inspection reports',
    'vehicle check',
    'inspection appointment',
    'inspection management',
  ],

  synonyms: [
    'vehicle inspection platform',
    'vehicle inspection software',
    'inspection station software',
    'emissions testing software',
    'safety inspection software',
    'vehicle testing software',
    'inspection scheduling software',
    'inspection management software',
    'vehicle compliance software',
    'inspection certificate software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'home inspection'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Appointments and results' },
    { id: 'admin', name: 'Inspection Dashboard', enabled: true, basePath: '/admin', requiredRole: 'inspector', layout: 'admin', description: 'Inspections and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Station Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'inspector', name: 'Inspector', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inspections' },
    { id: 'clerk', name: 'Clerk', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/appointments' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'vehicle-history',
    'recalls-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'clients',
    'reviews',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a vehicle inspection platform',
    'Create an inspection station app',
    'I need an emissions testing system',
    'Build a safety inspection app',
    'Create a vehicle inspection scheduling platform',
  ],
};
