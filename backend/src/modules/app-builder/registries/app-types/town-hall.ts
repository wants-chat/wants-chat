/**
 * Town Hall App Type Definition
 *
 * Complete definition for town hall applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOWN_HALL_APP_TYPE: AppTypeDefinition = {
  id: 'town-hall',
  name: 'Town Hall',
  category: 'services',
  description: 'Town Hall platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "town hall",
      "town",
      "hall",
      "town software",
      "town app",
      "town platform",
      "town system",
      "town management",
      "services town"
  ],

  synonyms: [
      "Town Hall platform",
      "Town Hall software",
      "Town Hall system",
      "town solution",
      "town service"
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
      "Build a town hall platform",
      "Create a town hall app",
      "I need a town hall management system",
      "Build a town hall solution",
      "Create a town hall booking system"
  ],
};
