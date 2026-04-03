/**
 * Umbrella Shop App Type Definition
 *
 * Complete definition for umbrella shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UMBRELLA_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'umbrella-shop',
  name: 'Umbrella Shop',
  category: 'retail',
  description: 'Umbrella Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "umbrella shop",
      "umbrella",
      "shop",
      "umbrella software",
      "umbrella app",
      "umbrella platform",
      "umbrella system",
      "umbrella management",
      "retail umbrella"
  ],

  synonyms: [
      "Umbrella Shop platform",
      "Umbrella Shop software",
      "Umbrella Shop system",
      "umbrella solution",
      "umbrella service"
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
      "Build a umbrella shop platform",
      "Create a umbrella shop app",
      "I need a umbrella shop management system",
      "Build a umbrella shop solution",
      "Create a umbrella shop booking system"
  ],
};
