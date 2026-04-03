/**
 * Weed Removal App Type Definition
 *
 * Complete definition for weed removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEED_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'weed-removal',
  name: 'Weed Removal',
  category: 'services',
  description: 'Weed Removal platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "weed removal",
      "weed",
      "removal",
      "weed software",
      "weed app",
      "weed platform",
      "weed system",
      "weed management",
      "services weed"
  ],

  synonyms: [
      "Weed Removal platform",
      "Weed Removal software",
      "Weed Removal system",
      "weed solution",
      "weed service"
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
      "Build a weed removal platform",
      "Create a weed removal app",
      "I need a weed removal management system",
      "Build a weed removal solution",
      "Create a weed removal booking system"
  ],
};
