/**
 * Interpreting App Type Definition
 *
 * Complete definition for interpreting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERPRETING_APP_TYPE: AppTypeDefinition = {
  id: 'interpreting',
  name: 'Interpreting',
  category: 'services',
  description: 'Interpreting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "interpreting",
      "interpreting software",
      "interpreting app",
      "interpreting platform",
      "interpreting system",
      "interpreting management",
      "services interpreting"
  ],

  synonyms: [
      "Interpreting platform",
      "Interpreting software",
      "Interpreting system",
      "interpreting solution",
      "interpreting service"
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
      "Build a interpreting platform",
      "Create a interpreting app",
      "I need a interpreting management system",
      "Build a interpreting solution",
      "Create a interpreting booking system"
  ],
};
