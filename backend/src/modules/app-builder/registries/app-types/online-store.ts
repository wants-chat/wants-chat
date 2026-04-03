/**
 * Online Store App Type Definition
 *
 * Complete definition for online store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_STORE_APP_TYPE: AppTypeDefinition = {
  id: 'online-store',
  name: 'Online Store',
  category: 'retail',
  description: 'Online Store platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "online store",
      "online",
      "store",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "retail online"
  ],

  synonyms: [
      "Online Store platform",
      "Online Store software",
      "Online Store system",
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
      "Build a online store platform",
      "Create a online store app",
      "I need a online store management system",
      "Build a online store solution",
      "Create a online store booking system"
  ],
};
