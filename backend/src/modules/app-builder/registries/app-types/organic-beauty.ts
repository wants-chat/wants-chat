/**
 * Organic Beauty App Type Definition
 *
 * Complete definition for organic beauty applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORGANIC_BEAUTY_APP_TYPE: AppTypeDefinition = {
  id: 'organic-beauty',
  name: 'Organic Beauty',
  category: 'beauty',
  description: 'Organic Beauty platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "organic beauty",
      "organic",
      "beauty",
      "organic software",
      "organic app",
      "organic platform",
      "organic system",
      "organic management",
      "beauty organic"
  ],

  synonyms: [
      "Organic Beauty platform",
      "Organic Beauty software",
      "Organic Beauty system",
      "organic solution",
      "organic service"
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
      "Build a organic beauty platform",
      "Create a organic beauty app",
      "I need a organic beauty management system",
      "Build a organic beauty solution",
      "Create a organic beauty booking system"
  ],
};
