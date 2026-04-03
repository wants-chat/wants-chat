/**
 * Trash Removal App Type Definition
 *
 * Complete definition for trash removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRASH_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'trash-removal',
  name: 'Trash Removal',
  category: 'services',
  description: 'Trash Removal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trash removal",
      "trash",
      "removal",
      "trash software",
      "trash app",
      "trash platform",
      "trash system",
      "trash management",
      "services trash"
  ],

  synonyms: [
      "Trash Removal platform",
      "Trash Removal software",
      "Trash Removal system",
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
      "Build a trash removal platform",
      "Create a trash removal app",
      "I need a trash removal management system",
      "Build a trash removal solution",
      "Create a trash removal booking system"
  ],
};
