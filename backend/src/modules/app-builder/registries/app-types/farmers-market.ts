/**
 * Farmers Market App Type Definition
 *
 * Complete definition for farmers market applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FARMERS_MARKET_APP_TYPE: AppTypeDefinition = {
  id: 'farmers-market',
  name: 'Farmers Market',
  category: 'retail',
  description: 'Farmers Market platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "farmers market",
      "farmers",
      "market",
      "farmers software",
      "farmers app",
      "farmers platform",
      "farmers system",
      "farmers management",
      "retail farmers"
  ],

  synonyms: [
      "Farmers Market platform",
      "Farmers Market software",
      "Farmers Market system",
      "farmers solution",
      "farmers service"
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
      "Build a farmers market platform",
      "Create a farmers market app",
      "I need a farmers market management system",
      "Build a farmers market solution",
      "Create a farmers market booking system"
  ],
};
