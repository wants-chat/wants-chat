/**
 * Specialty Retail App Type Definition
 *
 * Complete definition for specialty retail applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_RETAIL_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-retail',
  name: 'Specialty Retail',
  category: 'retail',
  description: 'Specialty Retail platform with comprehensive management features',
  icon: 'shopping-bag',

  keywords: [
      "specialty retail",
      "specialty",
      "retail",
      "specialty software",
      "specialty app",
      "specialty platform",
      "specialty system",
      "specialty management",
      "retail specialty"
  ],

  synonyms: [
      "Specialty Retail platform",
      "Specialty Retail software",
      "Specialty Retail system",
      "specialty solution",
      "specialty service"
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
      "shopping-cart",
      "checkout",
      "orders",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "inventory",
      "discounts",
      "reviews",
      "shipping"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'retail',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a specialty retail platform",
      "Create a specialty retail app",
      "I need a specialty retail management system",
      "Build a specialty retail solution",
      "Create a specialty retail booking system"
  ],
};
