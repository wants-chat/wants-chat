/**
 * Retail Banking App Type Definition
 *
 * Complete definition for retail banking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETAIL_BANKING_APP_TYPE: AppTypeDefinition = {
  id: 'retail-banking',
  name: 'Retail Banking',
  category: 'retail',
  description: 'Retail Banking platform with comprehensive management features',
  icon: 'shopping-bag',

  keywords: [
      "retail banking",
      "retail",
      "banking",
      "retail software",
      "retail app",
      "retail platform",
      "retail system",
      "retail management",
      "retail retail"
  ],

  synonyms: [
      "Retail Banking platform",
      "Retail Banking software",
      "Retail Banking system",
      "retail solution",
      "retail service"
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
      "shopping-cart",
      "checkout",
      "orders",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "inventory",
      "discounts",
      "reviews",
      "shipping"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a retail banking platform",
      "Create a retail banking app",
      "I need a retail banking management system",
      "Build a retail banking solution",
      "Create a retail banking booking system"
  ],
};
