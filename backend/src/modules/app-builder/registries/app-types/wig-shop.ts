/**
 * Wig Shop App Type Definition
 *
 * Complete definition for wig shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WIG_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'wig-shop',
  name: 'Wig Shop',
  category: 'retail',
  description: 'Wig Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "wig shop",
      "wig",
      "shop",
      "wig software",
      "wig app",
      "wig platform",
      "wig system",
      "wig management",
      "retail wig"
  ],

  synonyms: [
      "Wig Shop platform",
      "Wig Shop software",
      "Wig Shop system",
      "wig solution",
      "wig service"
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
      "Build a wig shop platform",
      "Create a wig shop app",
      "I need a wig shop management system",
      "Build a wig shop solution",
      "Create a wig shop booking system"
  ],
};
