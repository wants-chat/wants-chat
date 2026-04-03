/**
 * Western Store App Type Definition
 *
 * Complete definition for western store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WESTERN_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'western-store',
  name: 'Western Store',
  category: 'retail',
  description: 'Western Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "western store",
      "western",
      "store",
      "western software",
      "western app",
      "western platform",
      "western system",
      "western management",
      "retail western"
  ],

  synonyms: [
      "Western Store platform",
      "Western Store software",
      "Western Store system",
      "western solution",
      "western service"
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
      "Build a western store platform",
      "Create a western store app",
      "I need a western store management system",
      "Build a western store solution",
      "Create a western store booking system"
  ],
};
