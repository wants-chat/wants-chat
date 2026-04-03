/**
 * Seasonal Store App Type Definition
 *
 * Complete definition for seasonal store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEASONAL_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'seasonal-store',
  name: 'Seasonal Store',
  category: 'retail',
  description: 'Seasonal Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "seasonal store",
      "seasonal",
      "store",
      "seasonal software",
      "seasonal app",
      "seasonal platform",
      "seasonal system",
      "seasonal management",
      "retail seasonal"
  ],

  synonyms: [
      "Seasonal Store platform",
      "Seasonal Store software",
      "Seasonal Store system",
      "seasonal solution",
      "seasonal service"
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
      "Build a seasonal store platform",
      "Create a seasonal store app",
      "I need a seasonal store management system",
      "Build a seasonal store solution",
      "Create a seasonal store booking system"
  ],
};
