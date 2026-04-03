/**
 * Cake Decorating App Type Definition
 *
 * Complete definition for cake decorating applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CAKE_DECORATING_APP_TYPE: AppTypeDefinition = {
  id: 'cake-decorating',
  name: 'Cake Decorating',
  category: 'services',
  description: 'Cake Decorating platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cake decorating",
      "cake",
      "decorating",
      "cake software",
      "cake app",
      "cake platform",
      "cake system",
      "cake management",
      "services cake"
  ],

  synonyms: [
      "Cake Decorating platform",
      "Cake Decorating software",
      "Cake Decorating system",
      "cake solution",
      "cake service"
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
      "Build a cake decorating platform",
      "Create a cake decorating app",
      "I need a cake decorating management system",
      "Build a cake decorating solution",
      "Create a cake decorating booking system"
  ],
};
