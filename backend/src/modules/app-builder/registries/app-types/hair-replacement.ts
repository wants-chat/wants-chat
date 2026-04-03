/**
 * Hair Replacement App Type Definition
 *
 * Complete definition for hair replacement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_REPLACEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'hair-replacement',
  name: 'Hair Replacement',
  category: 'beauty',
  description: 'Hair Replacement platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "hair replacement",
      "hair",
      "replacement",
      "hair software",
      "hair app",
      "hair platform",
      "hair system",
      "hair management",
      "beauty hair"
  ],

  synonyms: [
      "Hair Replacement platform",
      "Hair Replacement software",
      "Hair Replacement system",
      "hair solution",
      "hair service"
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
      "scheduling",
      "pos-system",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "gallery",
      "subscriptions",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'beauty',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a hair replacement platform",
      "Create a hair replacement app",
      "I need a hair replacement management system",
      "Build a hair replacement solution",
      "Create a hair replacement booking system"
  ],
};
