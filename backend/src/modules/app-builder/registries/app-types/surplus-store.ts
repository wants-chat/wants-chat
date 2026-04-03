/**
 * Surplus Store App Type Definition
 *
 * Complete definition for surplus store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURPLUS_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'surplus-store',
  name: 'Surplus Store',
  category: 'retail',
  description: 'Surplus Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "surplus store",
      "surplus",
      "store",
      "surplus software",
      "surplus app",
      "surplus platform",
      "surplus system",
      "surplus management",
      "retail surplus"
  ],

  synonyms: [
      "Surplus Store platform",
      "Surplus Store software",
      "Surplus Store system",
      "surplus solution",
      "surplus service"
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
      "Build a surplus store platform",
      "Create a surplus store app",
      "I need a surplus store management system",
      "Build a surplus store solution",
      "Create a surplus store booking system"
  ],
};
