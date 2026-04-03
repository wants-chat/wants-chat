/**
 * Cosmetics App Type Definition
 *
 * Complete definition for cosmetics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COSMETICS_APP_TYPE: AppTypeDefinition = {
  id: 'cosmetics',
  name: 'Cosmetics',
  category: 'beauty',
  description: 'Cosmetics platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "cosmetics",
      "cosmetics software",
      "cosmetics app",
      "cosmetics platform",
      "cosmetics system",
      "cosmetics management",
      "beauty cosmetics"
  ],

  synonyms: [
      "Cosmetics platform",
      "Cosmetics software",
      "Cosmetics system",
      "cosmetics solution",
      "cosmetics service"
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
      "Build a cosmetics platform",
      "Create a cosmetics app",
      "I need a cosmetics management system",
      "Build a cosmetics solution",
      "Create a cosmetics booking system"
  ],
};
