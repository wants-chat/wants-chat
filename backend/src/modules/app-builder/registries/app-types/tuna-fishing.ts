/**
 * Tuna Fishing App Type Definition
 *
 * Complete definition for tuna fishing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUNA_FISHING_APP_TYPE: AppTypeDefinition = {
  id: 'tuna-fishing',
  name: 'Tuna Fishing',
  category: 'services',
  description: 'Tuna Fishing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tuna fishing",
      "tuna",
      "fishing",
      "tuna software",
      "tuna app",
      "tuna platform",
      "tuna system",
      "tuna management",
      "services tuna"
  ],

  synonyms: [
      "Tuna Fishing platform",
      "Tuna Fishing software",
      "Tuna Fishing system",
      "tuna solution",
      "tuna service"
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
      "Build a tuna fishing platform",
      "Create a tuna fishing app",
      "I need a tuna fishing management system",
      "Build a tuna fishing solution",
      "Create a tuna fishing booking system"
  ],
};
