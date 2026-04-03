/**
 * Wish List App Type Definition
 *
 * Complete definition for wish list applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WISH_LIST_APP_TYPE: AppTypeDefinition = {
  id: 'wish-list',
  name: 'Wish List',
  category: 'services',
  description: 'Wish List platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wish list",
      "wish",
      "list",
      "wish software",
      "wish app",
      "wish platform",
      "wish system",
      "wish management",
      "services wish"
  ],

  synonyms: [
      "Wish List platform",
      "Wish List software",
      "Wish List system",
      "wish solution",
      "wish service"
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
      "Build a wish list platform",
      "Create a wish list app",
      "I need a wish list management system",
      "Build a wish list solution",
      "Create a wish list booking system"
  ],
};
