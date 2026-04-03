/**
 * Tricycle Shop App Type Definition
 *
 * Complete definition for tricycle shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRICYCLE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tricycle-shop',
  name: 'Tricycle Shop',
  category: 'retail',
  description: 'Tricycle Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tricycle shop",
      "tricycle",
      "shop",
      "tricycle software",
      "tricycle app",
      "tricycle platform",
      "tricycle system",
      "tricycle management",
      "retail tricycle"
  ],

  synonyms: [
      "Tricycle Shop platform",
      "Tricycle Shop software",
      "Tricycle Shop system",
      "tricycle solution",
      "tricycle service"
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
      "Build a tricycle shop platform",
      "Create a tricycle shop app",
      "I need a tricycle shop management system",
      "Build a tricycle shop solution",
      "Create a tricycle shop booking system"
  ],
};
