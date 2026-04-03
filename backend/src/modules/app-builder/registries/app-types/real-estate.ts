/**
 * Real Estate Listings App Type Definition
 *
 * Complete definition for real estate listing and property search applications.
 * Essential for real estate agencies, agents, and property portals.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate',
  name: 'Real Estate Listings',
  category: 'real-estate',
  description: 'Real estate platform with property listings, search, agent profiles, and inquiry management',
  icon: 'house',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'real estate',
    'real estate listings',
    'property listings',
    'property search',
    'home search',
    'house search',
    'mls',
    'zillow',
    'realtor',
    'trulia',
    'redfin',
    'homes for sale',
    'houses for sale',
    'property for sale',
    'property for rent',
    'rental listings',
    'apartments',
    'condos',
    'real estate agent',
    'property portal',
    'real estate portal',
    'home buying',
    'home selling',
    'property marketplace',
    'commercial real estate',
    'idx',
  ],

  synonyms: [
    'property platform',
    'real estate platform',
    'home listing platform',
    'property search platform',
    'real estate marketplace',
    'property marketplace',
    'home finder',
    'property finder',
    'real estate app',
    'property app',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'property management',
    'rental management',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Property Portal',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public property search and listings',
    },
    {
      id: 'admin',
      name: 'Agent Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'agent',
      layout: 'admin',
      description: 'Property and lead management for agents',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'broker',
      name: 'Broker',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/agents',
    },
    {
      id: 'agent',
      name: 'Real Estate Agent',
      level: 40,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/listings',
    },
    {
      id: 'user',
      name: 'Home Buyer/Renter',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/search',
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
    'property-listings',
    'virtual-tours',
    'showing-management',
  ],

  optionalFeatures: [
    'scheduling',
    'crm',
    'announcements',
    'mls-integration',
    'open-houses',
    'property-valuation',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
    'inventory',
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
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a real estate listing platform',
    'Create a property search app like Zillow',
    'I need a real estate portal',
    'Build a home listing website',
    'Create a property marketplace',
    'I want to build a real estate app',
    'Make a real estate platform with map search',
  ],
};
