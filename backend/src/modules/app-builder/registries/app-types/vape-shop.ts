/**
 * Vape Shop App Type Definition
 *
 * Complete definition for vape shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VAPE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'vape-shop',
  name: 'Vape Shop',
  category: 'retail',
  description: 'Vape Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "vape shop",
      "vape",
      "shop",
      "vape software",
      "vape app",
      "vape platform",
      "vape system",
      "vape management",
      "retail vape"
  ],

  synonyms: [
      "Vape Shop platform",
      "Vape Shop software",
      "Vape Shop system",
      "vape solution",
      "vape service"
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
      "Build a vape shop platform",
      "Create a vape shop app",
      "I need a vape shop management system",
      "Build a vape shop solution",
      "Create a vape shop booking system"
  ],
};
