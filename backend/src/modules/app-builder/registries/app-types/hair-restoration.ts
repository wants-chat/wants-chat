/**
 * Hair Restoration App Type Definition
 *
 * Complete definition for hair restoration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HAIR_RESTORATION_APP_TYPE: AppTypeDefinition = {
  id: 'hair-restoration',
  name: 'Hair Restoration',
  category: 'beauty',
  description: 'Hair Restoration platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "hair restoration",
      "hair",
      "restoration",
      "hair software",
      "hair app",
      "hair platform",
      "hair system",
      "hair management",
      "beauty hair"
  ],

  synonyms: [
      "Hair Restoration platform",
      "Hair Restoration software",
      "Hair Restoration system",
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
      "Build a hair restoration platform",
      "Create a hair restoration app",
      "I need a hair restoration management system",
      "Build a hair restoration solution",
      "Create a hair restoration booking system"
  ],
};
