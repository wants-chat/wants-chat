/**
 * Hair Removal App Type Definition
 *
 * Complete definition for hair removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'hair-removal',
  name: 'Hair Removal',
  category: 'beauty',
  description: 'Hair Removal platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "hair removal",
      "hair",
      "removal",
      "hair software",
      "hair app",
      "hair platform",
      "hair system",
      "hair management",
      "beauty hair"
  ],

  synonyms: [
      "Hair Removal platform",
      "Hair Removal software",
      "Hair Removal system",
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
      "Build a hair removal platform",
      "Create a hair removal app",
      "I need a hair removal management system",
      "Build a hair removal solution",
      "Create a hair removal booking system"
  ],
};
