/**
 * Artificial Grass App Type Definition
 *
 * Complete definition for artificial grass applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARTIFICIAL_GRASS_APP_TYPE: AppTypeDefinition = {
  id: 'artificial-grass',
  name: 'Artificial Grass',
  category: 'services',
  description: 'Artificial Grass platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "artificial grass",
      "artificial",
      "grass",
      "artificial software",
      "artificial app",
      "artificial platform",
      "artificial system",
      "artificial management",
      "services artificial"
  ],

  synonyms: [
      "Artificial Grass platform",
      "Artificial Grass software",
      "Artificial Grass system",
      "artificial solution",
      "artificial service"
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
      "Build a artificial grass platform",
      "Create a artificial grass app",
      "I need a artificial grass management system",
      "Build a artificial grass solution",
      "Create a artificial grass booking system"
  ],
};
