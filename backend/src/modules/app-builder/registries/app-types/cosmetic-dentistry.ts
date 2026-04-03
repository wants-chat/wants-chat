/**
 * Cosmetic Dentistry App Type Definition
 *
 * Complete definition for cosmetic dentistry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COSMETIC_DENTISTRY_APP_TYPE: AppTypeDefinition = {
  id: 'cosmetic-dentistry',
  name: 'Cosmetic Dentistry',
  category: 'beauty',
  description: 'Cosmetic Dentistry platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "cosmetic dentistry",
      "cosmetic",
      "dentistry",
      "cosmetic software",
      "cosmetic app",
      "cosmetic platform",
      "cosmetic system",
      "cosmetic management",
      "beauty cosmetic"
  ],

  synonyms: [
      "Cosmetic Dentistry platform",
      "Cosmetic Dentistry software",
      "Cosmetic Dentistry system",
      "cosmetic solution",
      "cosmetic service"
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
      "Build a cosmetic dentistry platform",
      "Create a cosmetic dentistry app",
      "I need a cosmetic dentistry management system",
      "Build a cosmetic dentistry solution",
      "Create a cosmetic dentistry booking system"
  ],
};
