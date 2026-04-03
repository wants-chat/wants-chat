/**
 * Mystery Shopping App Type Definition
 *
 * Complete definition for mystery shopping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MYSTERY_SHOPPING_APP_TYPE: AppTypeDefinition = {
  id: 'mystery-shopping',
  name: 'Mystery Shopping',
  category: 'retail',
  description: 'Mystery Shopping platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "mystery shopping",
      "mystery",
      "shopping",
      "mystery software",
      "mystery app",
      "mystery platform",
      "mystery system",
      "mystery management",
      "retail mystery"
  ],

  synonyms: [
      "Mystery Shopping platform",
      "Mystery Shopping software",
      "Mystery Shopping system",
      "mystery solution",
      "mystery service"
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
      "Build a mystery shopping platform",
      "Create a mystery shopping app",
      "I need a mystery shopping management system",
      "Build a mystery shopping solution",
      "Create a mystery shopping booking system"
  ],
};
