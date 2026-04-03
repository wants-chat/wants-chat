/**
 * Online Shopping App Type Definition
 *
 * Complete definition for online shopping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_SHOPPING_APP_TYPE: AppTypeDefinition = {
  id: 'online-shopping',
  name: 'Online Shopping',
  category: 'retail',
  description: 'Online Shopping platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "online shopping",
      "online",
      "shopping",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "retail online"
  ],

  synonyms: [
      "Online Shopping platform",
      "Online Shopping software",
      "Online Shopping system",
      "online solution",
      "online service"
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
      "Build a online shopping platform",
      "Create a online shopping app",
      "I need a online shopping management system",
      "Build a online shopping solution",
      "Create a online shopping booking system"
  ],
};
