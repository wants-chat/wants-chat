/**
 * World Cuisine App Type Definition
 *
 * Complete definition for world cuisine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORLD_CUISINE_APP_TYPE: AppTypeDefinition = {
  id: 'world-cuisine',
  name: 'World Cuisine',
  category: 'services',
  description: 'World Cuisine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "world cuisine",
      "world",
      "cuisine",
      "world software",
      "world app",
      "world platform",
      "world system",
      "world management",
      "services world"
  ],

  synonyms: [
      "World Cuisine platform",
      "World Cuisine software",
      "World Cuisine system",
      "world solution",
      "world service"
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
      "Build a world cuisine platform",
      "Create a world cuisine app",
      "I need a world cuisine management system",
      "Build a world cuisine solution",
      "Create a world cuisine booking system"
  ],
};
