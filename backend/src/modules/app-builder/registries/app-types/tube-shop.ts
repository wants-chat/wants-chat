/**
 * Tube Shop App Type Definition
 *
 * Complete definition for tube shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUBE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tube-shop',
  name: 'Tube Shop',
  category: 'retail',
  description: 'Tube Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tube shop",
      "tube",
      "shop",
      "tube software",
      "tube app",
      "tube platform",
      "tube system",
      "tube management",
      "retail tube"
  ],

  synonyms: [
      "Tube Shop platform",
      "Tube Shop software",
      "Tube Shop system",
      "tube solution",
      "tube service"
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
      "Build a tube shop platform",
      "Create a tube shop app",
      "I need a tube shop management system",
      "Build a tube shop solution",
      "Create a tube shop booking system"
  ],
};
