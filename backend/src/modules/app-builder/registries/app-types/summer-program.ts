/**
 * Summer Program App Type Definition
 *
 * Complete definition for summer program applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUMMER_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'summer-program',
  name: 'Summer Program',
  category: 'services',
  description: 'Summer Program platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "summer program",
      "summer",
      "program",
      "summer software",
      "summer app",
      "summer platform",
      "summer system",
      "summer management",
      "services summer"
  ],

  synonyms: [
      "Summer Program platform",
      "Summer Program software",
      "Summer Program system",
      "summer solution",
      "summer service"
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
      "Build a summer program platform",
      "Create a summer program app",
      "I need a summer program management system",
      "Build a summer program solution",
      "Create a summer program booking system"
  ],
};
