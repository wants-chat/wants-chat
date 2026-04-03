/**
 * Property Management App Type Definition
 *
 * Complete definition for property and rental management applications.
 * Essential for landlords, property managers, and real estate companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPERTY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'property-management',
  name: 'Property Management',
  category: 'real-estate',
  description: 'Rental property management with tenants, leases, maintenance requests, and rent collection',
  icon: 'building',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'property management',
    'rental management',
    'landlord',
    'tenant management',
    'lease management',
    'rent collection',
    'rental property',
    'property manager',
    'apartment management',
    'real estate management',
    'maintenance requests',
    'tenant portal',
    'landlord portal',
    'rent tracking',
    'lease tracking',
    'property portfolio',
    'buildium',
    'appfolio',
    'rentec',
    'propertyware',
    'tenant screening',
    'vacancy management',
    'rental listings',
    'hoa management',
    'condo management',
  ],

  synonyms: [
    'rental software',
    'property software',
    'landlord software',
    'tenant tracker',
    'lease tracker',
    'rent management',
    'apartment tracker',
    'property tracker',
    'rental tracker',
    'housing management',
  ],

  negativeKeywords: [
    'real estate listing',
    'property listing',
    'mls',
    'home buying',
    'blog',
    'portfolio',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Tenant Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Tenant-facing portal for rent payments and maintenance requests',
    },
    {
      id: 'admin',
      name: 'Management Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'manager',
      layout: 'admin',
      description: 'Property management dashboard for landlords and managers',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Owner',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'manager',
      name: 'Property Manager',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/properties',
    },
    {
      id: 'maintenance',
      name: 'Maintenance Staff',
      level: 40,
      isDefault: false,
      accessibleSections: ['admin'],
      defaultRoute: '/admin/maintenance',
    },
    {
      id: 'tenant',
      name: 'Tenant',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/dashboard',
    },
    {
      id: 'applicant',
      name: 'Applicant',
      level: 10,
      isDefault: false,
      accessibleSections: ['frontend'],
      defaultRoute: '/apply',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
    'messaging',
    'documents',
    'lease-management',
    'tenant-screening',
    'rent-collection',
    'maintenance-requests',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'team-management',
    'mls-integration',
    'open-houses',
    'property-listings',
    'property-valuation',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'table-reservations',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a property management system for landlords',
    'Create a rental management platform',
    'I need a tenant portal with rent payments',
    'Build an app to manage my rental properties',
    'Create a system for tracking leases and maintenance',
    'I want to build a landlord management tool',
    'Make a property management app like Buildium',
  ],
};
