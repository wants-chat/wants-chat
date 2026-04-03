/**
 * Halloween Store App Type Definition
 *
 * Complete definition for halloween store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HALLOWEEN_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'halloween-store',
  name: 'Halloween Store',
  category: 'retail',
  description: 'Halloween Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "halloween store",
      "halloween",
      "store",
      "halloween software",
      "halloween app",
      "halloween platform",
      "halloween system",
      "halloween management",
      "retail halloween"
  ],

  synonyms: [
      "Halloween Store platform",
      "Halloween Store software",
      "Halloween Store system",
      "halloween solution",
      "halloween service"
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
      "inventory",
      "pos-system",
      "orders",
      "notifications"
  ],

  optionalFeatures: [
      "shopping-cart",
      "checkout",
      "payments",
      "discounts",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'retail',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a halloween store platform",
      "Create a halloween store app",
      "I need a halloween store management system",
      "Build a halloween store solution",
      "Create a halloween store booking system"
  ],
};
