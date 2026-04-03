/**
 * Custom Printing App Type Definition
 *
 * Complete definition for custom printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CUSTOM_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'custom-printing',
  name: 'Custom Printing',
  category: 'services',
  description: 'Custom Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "custom printing",
      "custom",
      "printing",
      "custom software",
      "custom app",
      "custom platform",
      "custom system",
      "custom management",
      "services custom"
  ],

  synonyms: [
      "Custom Printing platform",
      "Custom Printing software",
      "Custom Printing system",
      "custom solution",
      "custom service"
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
      "Build a custom printing platform",
      "Create a custom printing app",
      "I need a custom printing management system",
      "Build a custom printing solution",
      "Create a custom printing booking system"
  ],
};
