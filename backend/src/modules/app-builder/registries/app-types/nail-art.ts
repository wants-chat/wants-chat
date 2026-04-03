/**
 * Nail Art App Type Definition
 *
 * Complete definition for nail art applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NAIL_ART_APP_TYPE: AppTypeDefinition = {
  id: 'nail-art',
  name: 'Nail Art',
  category: 'beauty',
  description: 'Nail Art platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "nail art",
      "nail",
      "art",
      "nail software",
      "nail app",
      "nail platform",
      "nail system",
      "nail management",
      "beauty nail"
  ],

  synonyms: [
      "Nail Art platform",
      "Nail Art software",
      "Nail Art system",
      "nail solution",
      "nail service"
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
      "Build a nail art platform",
      "Create a nail art app",
      "I need a nail art management system",
      "Build a nail art solution",
      "Create a nail art booking system"
  ],
};
