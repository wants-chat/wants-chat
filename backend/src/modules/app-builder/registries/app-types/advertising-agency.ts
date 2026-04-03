/**
 * Advertising Agency App Type Definition
 *
 * Complete definition for advertising agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ADVERTISING_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'advertising-agency',
  name: 'Advertising Agency',
  category: 'services',
  description: 'Advertising Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "advertising agency",
      "advertising",
      "agency",
      "advertising software",
      "advertising app",
      "advertising platform",
      "advertising system",
      "advertising management",
      "services advertising"
  ],

  synonyms: [
      "Advertising Agency platform",
      "Advertising Agency software",
      "Advertising Agency system",
      "advertising solution",
      "advertising service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a advertising agency platform",
      "Create a advertising agency app",
      "I need a advertising agency management system",
      "Build a advertising agency solution",
      "Create a advertising agency booking system"
  ],
};
