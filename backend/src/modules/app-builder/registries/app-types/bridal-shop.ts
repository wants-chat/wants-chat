/**
 * Bridal Shop App Type Definition
 *
 * Complete definition for bridal shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BRIDAL_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'bridal-shop',
  name: 'Bridal Shop',
  category: 'retail',
  description: 'Bridal Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "bridal shop",
      "bridal",
      "shop",
      "bridal software",
      "bridal app",
      "bridal platform",
      "bridal system",
      "bridal management",
      "retail bridal"
  ],

  synonyms: [
      "Bridal Shop platform",
      "Bridal Shop software",
      "Bridal Shop system",
      "bridal solution",
      "bridal service"
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
      "Build a bridal shop platform",
      "Create a bridal shop app",
      "I need a bridal shop management system",
      "Build a bridal shop solution",
      "Create a bridal shop booking system"
  ],
};
