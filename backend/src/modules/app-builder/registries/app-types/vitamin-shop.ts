/**
 * Vitamin Shop App Type Definition
 *
 * Complete definition for vitamin shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VITAMIN_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'vitamin-shop',
  name: 'Vitamin Shop',
  category: 'retail',
  description: 'Vitamin Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "vitamin shop",
      "vitamin",
      "shop",
      "vitamin software",
      "vitamin app",
      "vitamin platform",
      "vitamin system",
      "vitamin management",
      "retail vitamin"
  ],

  synonyms: [
      "Vitamin Shop platform",
      "Vitamin Shop software",
      "Vitamin Shop system",
      "vitamin solution",
      "vitamin service"
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
      "Build a vitamin shop platform",
      "Create a vitamin shop app",
      "I need a vitamin shop management system",
      "Build a vitamin shop solution",
      "Create a vitamin shop booking system"
  ],
};
