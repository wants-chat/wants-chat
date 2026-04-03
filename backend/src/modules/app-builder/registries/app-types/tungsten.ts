/**
 * Tungsten App Type Definition
 *
 * Complete definition for tungsten applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUNGSTEN_APP_TYPE: AppTypeDefinition = {
  id: 'tungsten',
  name: 'Tungsten',
  category: 'services',
  description: 'Tungsten platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tungsten",
      "tungsten software",
      "tungsten app",
      "tungsten platform",
      "tungsten system",
      "tungsten management",
      "services tungsten"
  ],

  synonyms: [
      "Tungsten platform",
      "Tungsten software",
      "Tungsten system",
      "tungsten solution",
      "tungsten service"
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
      "Build a tungsten platform",
      "Create a tungsten app",
      "I need a tungsten management system",
      "Build a tungsten solution",
      "Create a tungsten booking system"
  ],
};
