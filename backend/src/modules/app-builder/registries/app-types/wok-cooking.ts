/**
 * Wok Cooking App Type Definition
 *
 * Complete definition for wok cooking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOK_COOKING_APP_TYPE: AppTypeDefinition = {
  id: 'wok-cooking',
  name: 'Wok Cooking',
  category: 'services',
  description: 'Wok Cooking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wok cooking",
      "wok",
      "cooking",
      "wok software",
      "wok app",
      "wok platform",
      "wok system",
      "wok management",
      "services wok"
  ],

  synonyms: [
      "Wok Cooking platform",
      "Wok Cooking software",
      "Wok Cooking system",
      "wok solution",
      "wok service"
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
      "Build a wok cooking platform",
      "Create a wok cooking app",
      "I need a wok cooking management system",
      "Build a wok cooking solution",
      "Create a wok cooking booking system"
  ],
};
