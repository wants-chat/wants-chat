/**
 * Pop Up Shop App Type Definition
 *
 * Complete definition for pop up shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POP_UP_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'pop-up-shop',
  name: 'Pop Up Shop',
  category: 'retail',
  description: 'Pop Up Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "pop up shop",
      "pop",
      "shop",
      "pop software",
      "pop app",
      "pop platform",
      "pop system",
      "pop management",
      "retail pop"
  ],

  synonyms: [
      "Pop Up Shop platform",
      "Pop Up Shop software",
      "Pop Up Shop system",
      "pop solution",
      "pop service"
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
      "Build a pop up shop platform",
      "Create a pop up shop app",
      "I need a pop up shop management system",
      "Build a pop up shop solution",
      "Create a pop up shop booking system"
  ],
};
