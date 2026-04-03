/**
 * Plant Shop App Type Definition
 *
 * Complete definition for plant shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLANT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'plant-shop',
  name: 'Plant Shop',
  category: 'retail',
  description: 'Plant Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "plant shop",
      "plant",
      "shop",
      "plant software",
      "plant app",
      "plant platform",
      "plant system",
      "plant management",
      "retail plant"
  ],

  synonyms: [
      "Plant Shop platform",
      "Plant Shop software",
      "Plant Shop system",
      "plant solution",
      "plant service"
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
      "product-catalog",
      "orders",
      "pos-system",
      "inventory",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "discounts",
      "reviews",
      "analytics",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a plant shop platform",
      "Create a plant shop app",
      "I need a plant shop management system",
      "Build a plant shop solution",
      "Create a plant shop booking system"
  ],
};
