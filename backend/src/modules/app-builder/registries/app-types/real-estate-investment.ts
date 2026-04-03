/**
 * Real Estate Investment App Type Definition
 *
 * Complete definition for real estate investment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_INVESTMENT_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-investment',
  name: 'Real Estate Investment',
  category: 'real-estate',
  description: 'Real Estate Investment platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "real estate investment",
      "real",
      "estate",
      "investment",
      "real software",
      "real app",
      "real platform",
      "real system",
      "real management",
      "real-estate real"
  ],

  synonyms: [
      "Real Estate Investment platform",
      "Real Estate Investment software",
      "Real Estate Investment system",
      "real solution",
      "real service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Broker",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Agent",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "property-listings",
      "showing-management",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "virtual-tours",
      "mls-integration",
      "property-valuation",
      "clients",
      "crm"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a real estate investment platform",
      "Create a real estate investment app",
      "I need a real estate investment management system",
      "Build a real estate investment solution",
      "Create a real estate investment booking system"
  ],
};
