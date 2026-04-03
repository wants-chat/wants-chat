/**
 * Variety Store App Type Definition
 *
 * Complete definition for variety store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VARIETY_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'variety-store',
  name: 'Variety Store',
  category: 'retail',
  description: 'Variety Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "variety store",
      "variety",
      "store",
      "variety software",
      "variety app",
      "variety platform",
      "variety system",
      "variety management",
      "retail variety"
  ],

  synonyms: [
      "Variety Store platform",
      "Variety Store software",
      "Variety Store system",
      "variety solution",
      "variety service"
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
      "Build a variety store platform",
      "Create a variety store app",
      "I need a variety store management system",
      "Build a variety store solution",
      "Create a variety store booking system"
  ],
};
