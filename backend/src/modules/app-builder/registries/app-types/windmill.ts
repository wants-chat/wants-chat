/**
 * Windmill App Type Definition
 *
 * Complete definition for windmill applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDMILL_APP_TYPE: AppTypeDefinition = {
  id: 'windmill',
  name: 'Windmill',
  category: 'services',
  description: 'Windmill platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "windmill",
      "windmill software",
      "windmill app",
      "windmill platform",
      "windmill system",
      "windmill management",
      "services windmill"
  ],

  synonyms: [
      "Windmill platform",
      "Windmill software",
      "Windmill system",
      "windmill solution",
      "windmill service"
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
      "Build a windmill platform",
      "Create a windmill app",
      "I need a windmill management system",
      "Build a windmill solution",
      "Create a windmill booking system"
  ],
};
