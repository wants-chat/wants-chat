/**
 * Capital Investment App Type Definition
 *
 * Complete definition for capital investment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAPITAL_INVESTMENT_APP_TYPE: AppTypeDefinition = {
  id: 'capital-investment',
  name: 'Capital Investment',
  category: 'services',
  description: 'Capital Investment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "capital investment",
      "capital",
      "investment",
      "capital software",
      "capital app",
      "capital platform",
      "capital system",
      "capital management",
      "services capital"
  ],

  synonyms: [
      "Capital Investment platform",
      "Capital Investment software",
      "Capital Investment system",
      "capital solution",
      "capital service"
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
      "Build a capital investment platform",
      "Create a capital investment app",
      "I need a capital investment management system",
      "Build a capital investment solution",
      "Create a capital investment booking system"
  ],
};
