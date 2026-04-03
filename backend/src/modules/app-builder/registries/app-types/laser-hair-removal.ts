/**
 * Laser Hair Removal App Type Definition
 *
 * Complete definition for laser hair removal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LASER_HAIR_REMOVAL_APP_TYPE: AppTypeDefinition = {
  id: 'laser-hair-removal',
  name: 'Laser Hair Removal',
  category: 'beauty',
  description: 'Laser Hair Removal platform with comprehensive management features',
  icon: 'sparkles',

  keywords: [
      "laser hair removal",
      "laser",
      "hair",
      "removal",
      "laser software",
      "laser app",
      "laser platform",
      "laser system",
      "laser management",
      "beauty laser"
  ],

  synonyms: [
      "Laser Hair Removal platform",
      "Laser Hair Removal software",
      "Laser Hair Removal system",
      "laser solution",
      "laser service"
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
      "Build a laser hair removal platform",
      "Create a laser hair removal app",
      "I need a laser hair removal management system",
      "Build a laser hair removal solution",
      "Create a laser hair removal booking system"
  ],
};
