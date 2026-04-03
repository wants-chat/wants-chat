/**
 * Yarn Shop App Type Definition
 *
 * Complete definition for yarn shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'yarn-shop',
  name: 'Yarn Shop',
  category: 'retail',
  description: 'Yarn Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "yarn shop",
      "yarn",
      "shop",
      "yarn software",
      "yarn app",
      "yarn platform",
      "yarn system",
      "yarn management",
      "retail yarn"
  ],

  synonyms: [
      "Yarn Shop platform",
      "Yarn Shop software",
      "Yarn Shop system",
      "yarn solution",
      "yarn service"
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
      "Build a yarn shop platform",
      "Create a yarn shop app",
      "I need a yarn shop management system",
      "Build a yarn shop solution",
      "Create a yarn shop booking system"
  ],
};
