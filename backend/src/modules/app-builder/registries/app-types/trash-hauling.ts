/**
 * Trash Hauling App Type Definition
 *
 * Complete definition for trash hauling applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRASH_HAULING_APP_TYPE: AppTypeDefinition = {
  id: 'trash-hauling',
  name: 'Trash Hauling',
  category: 'services',
  description: 'Trash Hauling platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trash hauling",
      "trash",
      "hauling",
      "trash software",
      "trash app",
      "trash platform",
      "trash system",
      "trash management",
      "services trash"
  ],

  synonyms: [
      "Trash Hauling platform",
      "Trash Hauling software",
      "Trash Hauling system",
      "trash solution",
      "trash service"
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
      "Build a trash hauling platform",
      "Create a trash hauling app",
      "I need a trash hauling management system",
      "Build a trash hauling solution",
      "Create a trash hauling booking system"
  ],
};
