/**
 * Offset Printing App Type Definition
 *
 * Complete definition for offset printing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFSET_PRINTING_APP_TYPE: AppTypeDefinition = {
  id: 'offset-printing',
  name: 'Offset Printing',
  category: 'services',
  description: 'Offset Printing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "offset printing",
      "offset",
      "printing",
      "offset software",
      "offset app",
      "offset platform",
      "offset system",
      "offset management",
      "services offset"
  ],

  synonyms: [
      "Offset Printing platform",
      "Offset Printing software",
      "Offset Printing system",
      "offset solution",
      "offset service"
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
      "Build a offset printing platform",
      "Create a offset printing app",
      "I need a offset printing management system",
      "Build a offset printing solution",
      "Create a offset printing booking system"
  ],
};
