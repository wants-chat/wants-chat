/**
 * HOA App Type Definition
 *
 * Complete definition for homeowners association and community management applications.
 * Essential for HOAs, condo associations, and residential community management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOA_APP_TYPE: AppTypeDefinition = {
  id: 'hoa',
  name: 'HOA',
  category: 'property',
  description: 'HOA platform with dues collection, violation tracking, amenity booking, and community communications',
  icon: 'home',

  keywords: [
    'hoa',
    'homeowners association',
    'hoa management',
    'condo association',
    'community association',
    'property management',
    'hoa dues',
    'hoa violations',
    'amenity booking',
    'community portal',
    'hoa board',
    'architectural review',
    'community rules',
    'hoa fees',
    'resident portal',
    'neighborhood association',
    'townhouse association',
    'common areas',
    'hoa meetings',
    'community documents',
    'maintenance requests',
  ],

  synonyms: [
    'hoa platform',
    'hoa software',
    'homeowners association software',
    'community association software',
    'hoa management software',
    'condo association software',
    'hoa portal',
    'community management software',
    'hoa app',
    'property association software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Resident Portal', enabled: true, basePath: '/', layout: 'public', description: 'Pay dues and book amenities' },
    { id: 'admin', name: 'HOA Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Properties and violations' },
  ],

  roles: [
    { id: 'admin', name: 'HOA Administrator', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'board', name: 'Board Member', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/board' },
    { id: 'manager', name: 'Property Manager', level: 75, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/properties' },
    { id: 'arc', name: 'ARC Committee', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/requests' },
    { id: 'staff', name: 'Staff', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/maintenance' },
    { id: 'resident', name: 'Resident', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'announcements',
    'notifications',
    'search',
    'messaging',
    'documents',
    'maintenance-requests',
    'rent-collection',
    'lease-management',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'reporting',
    'analytics',
    'mls-integration',
    'open-houses',
    'property-listings',
    'tenant-screening',
    'property-valuation',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'property',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an HOA management platform',
    'Create a homeowners association portal',
    'I need a condo association app',
    'Build an HOA with dues and amenity booking',
    'Create a community association management system',
  ],
};
