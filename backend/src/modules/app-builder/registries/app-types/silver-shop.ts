/**
 * Silver Shop App Type Definition
 *
 * Complete definition for silver shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SILVER_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'silver-shop',
  name: 'Silver Shop',
  category: 'retail',
  description: 'Silver Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "silver shop",
      "silver",
      "shop",
      "silver software",
      "silver app",
      "silver platform",
      "silver system",
      "silver management",
      "retail silver"
  ],

  synonyms: [
      "Silver Shop platform",
      "Silver Shop software",
      "Silver Shop system",
      "silver solution",
      "silver service"
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
      "Build a silver shop platform",
      "Create a silver shop app",
      "I need a silver shop management system",
      "Build a silver shop solution",
      "Create a silver shop booking system"
  ],
};
