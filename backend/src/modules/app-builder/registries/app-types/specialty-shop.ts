/**
 * Specialty Shop App Type Definition
 *
 * Complete definition for specialty shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-shop',
  name: 'Specialty Shop',
  category: 'retail',
  description: 'Specialty Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "specialty shop",
      "specialty",
      "shop",
      "specialty software",
      "specialty app",
      "specialty platform",
      "specialty system",
      "specialty management",
      "retail specialty"
  ],

  synonyms: [
      "Specialty Shop platform",
      "Specialty Shop software",
      "Specialty Shop system",
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
      "Build a specialty shop platform",
      "Create a specialty shop app",
      "I need a specialty shop management system",
      "Build a specialty shop solution",
      "Create a specialty shop booking system"
  ],
};
