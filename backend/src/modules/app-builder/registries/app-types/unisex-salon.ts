/**
 * Unisex Salon App Type Definition
 *
 * Complete definition for unisex salon applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UNISEX_SALON_APP_TYPE: AppTypeDefinition = {
  id: 'unisex-salon',
  name: 'Unisex Salon',
  category: 'beauty',
  description: 'Unisex Salon platform with comprehensive management features',
  icon: 'scissors',

  keywords: [
      "unisex salon",
      "unisex",
      "salon",
      "unisex software",
      "unisex app",
      "unisex platform",
      "unisex system",
      "unisex management",
      "beauty unisex"
  ],

  synonyms: [
      "Unisex Salon platform",
      "Unisex Salon software",
      "Unisex Salon system",
      "unisex solution",
      "unisex service"
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
      "team-management",
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
      "Build a unisex salon platform",
      "Create a unisex salon app",
      "I need a unisex salon management system",
      "Build a unisex salon solution",
      "Create a unisex salon booking system"
  ],
};
