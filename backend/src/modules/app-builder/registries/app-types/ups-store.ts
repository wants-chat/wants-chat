/**
 * Ups Store App Type Definition
 *
 * Complete definition for ups store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UPS_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'ups-store',
  name: 'Ups Store',
  category: 'retail',
  description: 'Ups Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "ups store",
      "ups",
      "store",
      "ups software",
      "ups app",
      "ups platform",
      "ups system",
      "ups management",
      "retail ups"
  ],

  synonyms: [
      "Ups Store platform",
      "Ups Store software",
      "Ups Store system",
      "ups solution",
      "ups service"
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
      "Build a ups store platform",
      "Create a ups store app",
      "I need a ups store management system",
      "Build a ups store solution",
      "Create a ups store booking system"
  ],
};
