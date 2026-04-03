/**
 * Trophy Shop App Type Definition
 *
 * Complete definition for trophy shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TROPHY_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'trophy-shop',
  name: 'Trophy Shop',
  category: 'retail',
  description: 'Trophy Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "trophy shop",
      "trophy",
      "shop",
      "trophy software",
      "trophy app",
      "trophy platform",
      "trophy system",
      "trophy management",
      "retail trophy"
  ],

  synonyms: [
      "Trophy Shop platform",
      "Trophy Shop software",
      "Trophy Shop system",
      "trophy solution",
      "trophy service"
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
      "Build a trophy shop platform",
      "Create a trophy shop app",
      "I need a trophy shop management system",
      "Build a trophy shop solution",
      "Create a trophy shop booking system"
  ],
};
