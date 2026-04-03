/**
 * Pastry Shop App Type Definition
 *
 * Complete definition for pastry shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PASTRY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'pastry-shop',
  name: 'Pastry Shop',
  category: 'retail',
  description: 'Pastry Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "pastry shop",
      "pastry",
      "shop",
      "pastry software",
      "pastry app",
      "pastry platform",
      "pastry system",
      "pastry management",
      "retail pastry"
  ],

  synonyms: [
      "Pastry Shop platform",
      "Pastry Shop software",
      "Pastry Shop system",
      "pastry solution",
      "pastry service"
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
      "Build a pastry shop platform",
      "Create a pastry shop app",
      "I need a pastry shop management system",
      "Build a pastry shop solution",
      "Create a pastry shop booking system"
  ],
};
