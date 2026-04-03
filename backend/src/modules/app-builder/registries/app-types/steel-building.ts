/**
 * Steel Building App Type Definition
 *
 * Complete definition for steel building applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STEEL_BUILDING_APP_TYPE: AppTypeDefinition = {
  id: 'steel-building',
  name: 'Steel Building',
  category: 'services',
  description: 'Steel Building platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "steel building",
      "steel",
      "building",
      "steel software",
      "steel app",
      "steel platform",
      "steel system",
      "steel management",
      "services steel"
  ],

  synonyms: [
      "Steel Building platform",
      "Steel Building software",
      "Steel Building system",
      "steel solution",
      "steel service"
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
      "Build a steel building platform",
      "Create a steel building app",
      "I need a steel building management system",
      "Build a steel building solution",
      "Create a steel building booking system"
  ],
};
