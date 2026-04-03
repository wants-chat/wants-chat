/**
 * Donut Shop App Type Definition
 *
 * Complete definition for donut shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DONUT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'donut-shop',
  name: 'Donut Shop',
  category: 'retail',
  description: 'Donut Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "donut shop",
      "donut",
      "shop",
      "donut software",
      "donut app",
      "donut platform",
      "donut system",
      "donut management",
      "retail donut"
  ],

  synonyms: [
      "Donut Shop platform",
      "Donut Shop software",
      "Donut Shop system",
      "donut solution",
      "donut service"
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
      "Build a donut shop platform",
      "Create a donut shop app",
      "I need a donut shop management system",
      "Build a donut shop solution",
      "Create a donut shop booking system"
  ],
};
