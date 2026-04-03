/**
 * Sandwich Shop App Type Definition
 *
 * Complete definition for sandwich shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SANDWICH_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'sandwich-shop',
  name: 'Sandwich Shop',
  category: 'retail',
  description: 'Sandwich Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "sandwich shop",
      "sandwich",
      "shop",
      "sandwich software",
      "sandwich app",
      "sandwich platform",
      "sandwich system",
      "sandwich management",
      "retail sandwich"
  ],

  synonyms: [
      "Sandwich Shop platform",
      "Sandwich Shop software",
      "Sandwich Shop system",
      "sandwich solution",
      "sandwich service"
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
      "Build a sandwich shop platform",
      "Create a sandwich shop app",
      "I need a sandwich shop management system",
      "Build a sandwich shop solution",
      "Create a sandwich shop booking system"
  ],
};
