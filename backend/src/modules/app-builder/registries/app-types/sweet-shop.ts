/**
 * Sweet Shop App Type Definition
 *
 * Complete definition for sweet shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SWEET_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'sweet-shop',
  name: 'Sweet Shop',
  category: 'retail',
  description: 'Sweet Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "sweet shop",
      "sweet",
      "shop",
      "sweet software",
      "sweet app",
      "sweet platform",
      "sweet system",
      "sweet management",
      "retail sweet"
  ],

  synonyms: [
      "Sweet Shop platform",
      "Sweet Shop software",
      "Sweet Shop system",
      "sweet solution",
      "sweet service"
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
      "Build a sweet shop platform",
      "Create a sweet shop app",
      "I need a sweet shop management system",
      "Build a sweet shop solution",
      "Create a sweet shop booking system"
  ],
};
