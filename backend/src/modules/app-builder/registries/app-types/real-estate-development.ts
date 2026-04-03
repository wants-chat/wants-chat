/**
 * Real Estate Development App Type Definition
 *
 * Complete definition for real estate development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REAL_ESTATE_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'real-estate-development',
  name: 'Real Estate Development',
  category: 'real-estate',
  description: 'Real Estate Development platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "real estate development",
      "real",
      "estate",
      "development",
      "real software",
      "real app",
      "real platform",
      "real system",
      "real management",
      "real-estate real"
  ],

  synonyms: [
      "Real Estate Development platform",
      "Real Estate Development software",
      "Real Estate Development system",
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
      "Build a real estate development platform",
      "Create a real estate development app",
      "I need a real estate development management system",
      "Build a real estate development solution",
      "Create a real estate development booking system"
  ],
};
