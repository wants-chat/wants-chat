/**
 * Tamale Shop App Type Definition
 *
 * Complete definition for tamale shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TAMALE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tamale-shop',
  name: 'Tamale Shop',
  category: 'retail',
  description: 'Tamale Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tamale shop",
      "tamale",
      "shop",
      "tamale software",
      "tamale app",
      "tamale platform",
      "tamale system",
      "tamale management",
      "retail tamale"
  ],

  synonyms: [
      "Tamale Shop platform",
      "Tamale Shop software",
      "Tamale Shop system",
      "tamale solution",
      "tamale service"
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
      "Build a tamale shop platform",
      "Create a tamale shop app",
      "I need a tamale shop management system",
      "Build a tamale shop solution",
      "Create a tamale shop booking system"
  ],
};
