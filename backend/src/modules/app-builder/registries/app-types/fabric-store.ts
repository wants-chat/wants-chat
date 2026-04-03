/**
 * Fabric Store App Type Definition
 *
 * Complete definition for fabric store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FABRIC_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'fabric-store',
  name: 'Fabric Store',
  category: 'retail',
  description: 'Fabric Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "fabric store",
      "fabric",
      "store",
      "fabric software",
      "fabric app",
      "fabric platform",
      "fabric system",
      "fabric management",
      "retail fabric"
  ],

  synonyms: [
      "Fabric Store platform",
      "Fabric Store software",
      "Fabric Store system",
      "fabric solution",
      "fabric service"
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
      "Build a fabric store platform",
      "Create a fabric store app",
      "I need a fabric store management system",
      "Build a fabric store solution",
      "Create a fabric store booking system"
  ],
};
