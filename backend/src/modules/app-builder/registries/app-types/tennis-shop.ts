/**
 * Tennis Shop App Type Definition
 *
 * Complete definition for tennis shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TENNIS_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'tennis-shop',
  name: 'Tennis Shop',
  category: 'retail',
  description: 'Tennis Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "tennis shop",
      "tennis",
      "shop",
      "tennis software",
      "tennis app",
      "tennis platform",
      "tennis system",
      "tennis management",
      "retail tennis"
  ],

  synonyms: [
      "Tennis Shop platform",
      "Tennis Shop software",
      "Tennis Shop system",
      "tennis solution",
      "tennis service"
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
      "Build a tennis shop platform",
      "Create a tennis shop app",
      "I need a tennis shop management system",
      "Build a tennis shop solution",
      "Create a tennis shop booking system"
  ],
};
