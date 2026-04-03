/**
 * Lingerie Shop App Type Definition
 *
 * Complete definition for lingerie shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LINGERIE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'lingerie-shop',
  name: 'Lingerie Shop',
  category: 'retail',
  description: 'Lingerie Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "lingerie shop",
      "lingerie",
      "shop",
      "lingerie software",
      "lingerie app",
      "lingerie platform",
      "lingerie system",
      "lingerie management",
      "retail lingerie"
  ],

  synonyms: [
      "Lingerie Shop platform",
      "Lingerie Shop software",
      "Lingerie Shop system",
      "lingerie solution",
      "lingerie service"
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
      "Build a lingerie shop platform",
      "Create a lingerie shop app",
      "I need a lingerie shop management system",
      "Build a lingerie shop solution",
      "Create a lingerie shop booking system"
  ],
};
