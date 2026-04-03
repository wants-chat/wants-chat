/**
 * Surfboard App Type Definition
 *
 * Complete definition for surfboard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURFBOARD_APP_TYPE: AppTypeDefinition = {
  id: 'surfboard',
  name: 'Surfboard',
  category: 'services',
  description: 'Surfboard platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "surfboard",
      "surfboard software",
      "surfboard app",
      "surfboard platform",
      "surfboard system",
      "surfboard management",
      "services surfboard"
  ],

  synonyms: [
      "Surfboard platform",
      "Surfboard software",
      "Surfboard system",
      "surfboard solution",
      "surfboard service"
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
      "Build a surfboard platform",
      "Create a surfboard app",
      "I need a surfboard management system",
      "Build a surfboard solution",
      "Create a surfboard booking system"
  ],
};
