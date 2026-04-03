/**
 * Souvenir Shop App Type Definition
 *
 * Complete definition for souvenir shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOUVENIR_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'souvenir-shop',
  name: 'Souvenir Shop',
  category: 'retail',
  description: 'Souvenir Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "souvenir shop",
      "souvenir",
      "shop",
      "souvenir software",
      "souvenir app",
      "souvenir platform",
      "souvenir system",
      "souvenir management",
      "retail souvenir"
  ],

  synonyms: [
      "Souvenir Shop platform",
      "Souvenir Shop software",
      "Souvenir Shop system",
      "souvenir solution",
      "souvenir service"
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
      "Build a souvenir shop platform",
      "Create a souvenir shop app",
      "I need a souvenir shop management system",
      "Build a souvenir shop solution",
      "Create a souvenir shop booking system"
  ],
};
