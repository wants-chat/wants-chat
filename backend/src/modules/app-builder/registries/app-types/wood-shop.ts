/**
 * Wood Shop App Type Definition
 *
 * Complete definition for wood shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOOD_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'wood-shop',
  name: 'Wood Shop',
  category: 'retail',
  description: 'Wood Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "wood shop",
      "wood",
      "shop",
      "wood software",
      "wood app",
      "wood platform",
      "wood system",
      "wood management",
      "retail wood"
  ],

  synonyms: [
      "Wood Shop platform",
      "Wood Shop software",
      "Wood Shop system",
      "wood solution",
      "wood service"
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
      "Build a wood shop platform",
      "Create a wood shop app",
      "I need a wood shop management system",
      "Build a wood shop solution",
      "Create a wood shop booking system"
  ],
};
