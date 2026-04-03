/**
 * Viticulture App Type Definition
 *
 * Complete definition for viticulture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VITICULTURE_APP_TYPE: AppTypeDefinition = {
  id: 'viticulture',
  name: 'Viticulture',
  category: 'services',
  description: 'Viticulture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "viticulture",
      "viticulture software",
      "viticulture app",
      "viticulture platform",
      "viticulture system",
      "viticulture management",
      "services viticulture"
  ],

  synonyms: [
      "Viticulture platform",
      "Viticulture software",
      "Viticulture system",
      "viticulture solution",
      "viticulture service"
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
      "Build a viticulture platform",
      "Create a viticulture app",
      "I need a viticulture management system",
      "Build a viticulture solution",
      "Create a viticulture booking system"
  ],
};
