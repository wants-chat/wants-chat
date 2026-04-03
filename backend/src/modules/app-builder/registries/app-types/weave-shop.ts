/**
 * Weave Shop App Type Definition
 *
 * Complete definition for weave shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEAVE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'weave-shop',
  name: 'Weave Shop',
  category: 'retail',
  description: 'Weave Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "weave shop",
      "weave",
      "shop",
      "weave software",
      "weave app",
      "weave platform",
      "weave system",
      "weave management",
      "retail weave"
  ],

  synonyms: [
      "Weave Shop platform",
      "Weave Shop software",
      "Weave Shop system",
      "weave solution",
      "weave service"
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
      "Build a weave shop platform",
      "Create a weave shop app",
      "I need a weave shop management system",
      "Build a weave shop solution",
      "Create a weave shop booking system"
  ],
};
