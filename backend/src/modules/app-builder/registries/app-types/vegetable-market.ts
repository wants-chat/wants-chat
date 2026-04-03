/**
 * Vegetable Market App Type Definition
 *
 * Complete definition for vegetable market applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEGETABLE_MARKET_APP_TYPE: AppTypeDefinition = {
  id: 'vegetable-market',
  name: 'Vegetable Market',
  category: 'retail',
  description: 'Vegetable Market platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "vegetable market",
      "vegetable",
      "market",
      "vegetable software",
      "vegetable app",
      "vegetable platform",
      "vegetable system",
      "vegetable management",
      "retail vegetable"
  ],

  synonyms: [
      "Vegetable Market platform",
      "Vegetable Market software",
      "Vegetable Market system",
      "vegetable solution",
      "vegetable service"
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
      "Build a vegetable market platform",
      "Create a vegetable market app",
      "I need a vegetable market management system",
      "Build a vegetable market solution",
      "Create a vegetable market booking system"
  ],
};
