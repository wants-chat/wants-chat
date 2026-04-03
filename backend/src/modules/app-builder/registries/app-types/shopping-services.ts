/**
 * Shopping Services App Type Definition
 *
 * Complete definition for shopping services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHOPPING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'shopping-services',
  name: 'Shopping Services',
  category: 'retail',
  description: 'Shopping Services platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "shopping services",
      "shopping",
      "services",
      "shopping software",
      "shopping app",
      "shopping platform",
      "shopping system",
      "shopping management",
      "retail shopping"
  ],

  synonyms: [
      "Shopping Services platform",
      "Shopping Services software",
      "Shopping Services system",
      "shopping solution",
      "shopping service"
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
      "Build a shopping services platform",
      "Create a shopping services app",
      "I need a shopping services management system",
      "Build a shopping services solution",
      "Create a shopping services booking system"
  ],
};
