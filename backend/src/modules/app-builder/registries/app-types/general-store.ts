/**
 * General Store App Type Definition
 *
 * Complete definition for general store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GENERAL_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'general-store',
  name: 'General Store',
  category: 'retail',
  description: 'General Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "general store",
      "general",
      "store",
      "general software",
      "general app",
      "general platform",
      "general system",
      "general management",
      "retail general"
  ],

  synonyms: [
      "General Store platform",
      "General Store software",
      "General Store system",
      "general solution",
      "general service"
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
      "Build a general store platform",
      "Create a general store app",
      "I need a general store management system",
      "Build a general store solution",
      "Create a general store booking system"
  ],
};
