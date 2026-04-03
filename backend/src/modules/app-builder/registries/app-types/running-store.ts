/**
 * Running Store App Type Definition
 *
 * Complete definition for running store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RUNNING_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'running-store',
  name: 'Running Store',
  category: 'retail',
  description: 'Running Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "running store",
      "running",
      "store",
      "running software",
      "running app",
      "running platform",
      "running system",
      "running management",
      "retail running"
  ],

  synonyms: [
      "Running Store platform",
      "Running Store software",
      "Running Store system",
      "running solution",
      "running service"
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
      "Build a running store platform",
      "Create a running store app",
      "I need a running store management system",
      "Build a running store solution",
      "Create a running store booking system"
  ],
};
