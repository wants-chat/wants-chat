/**
 * Quilt Shop App Type Definition
 *
 * Complete definition for quilt shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QUILT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'quilt-shop',
  name: 'Quilt Shop',
  category: 'retail',
  description: 'Quilt Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "quilt shop",
      "quilt",
      "shop",
      "quilt software",
      "quilt app",
      "quilt platform",
      "quilt system",
      "quilt management",
      "retail quilt"
  ],

  synonyms: [
      "Quilt Shop platform",
      "Quilt Shop software",
      "Quilt Shop system",
      "quilt solution",
      "quilt service"
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
      "Build a quilt shop platform",
      "Create a quilt shop app",
      "I need a quilt shop management system",
      "Build a quilt shop solution",
      "Create a quilt shop booking system"
  ],
};
