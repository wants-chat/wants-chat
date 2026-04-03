/**
 * Vintage Shop App Type Definition
 *
 * Complete definition for vintage shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VINTAGE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'vintage-shop',
  name: 'Vintage Shop',
  category: 'retail',
  description: 'Vintage Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "vintage shop",
      "vintage",
      "shop",
      "vintage software",
      "vintage app",
      "vintage platform",
      "vintage system",
      "vintage management",
      "retail vintage"
  ],

  synonyms: [
      "Vintage Shop platform",
      "Vintage Shop software",
      "Vintage Shop system",
      "vintage solution",
      "vintage service"
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
      "Build a vintage shop platform",
      "Create a vintage shop app",
      "I need a vintage shop management system",
      "Build a vintage shop solution",
      "Create a vintage shop booking system"
  ],
};
