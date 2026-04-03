/**
 * Online Retail App Type Definition
 *
 * Complete definition for online retail applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_RETAIL_APP_TYPE: AppTypeDefinition = {
  id: 'online-retail',
  name: 'Online Retail',
  category: 'retail',
  description: 'Online Retail platform with comprehensive management features',
  icon: 'shopping-bag',

  keywords: [
      "online retail",
      "online",
      "retail",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "retail online"
  ],

  synonyms: [
      "Online Retail platform",
      "Online Retail software",
      "Online Retail system",
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
      "Build a online retail platform",
      "Create a online retail app",
      "I need a online retail management system",
      "Build a online retail solution",
      "Create a online retail booking system"
  ],
};
