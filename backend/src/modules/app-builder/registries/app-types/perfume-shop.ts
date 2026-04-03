/**
 * Perfume Shop App Type Definition
 *
 * Complete definition for perfume shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PERFUME_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'perfume-shop',
  name: 'Perfume Shop',
  category: 'retail',
  description: 'Perfume Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "perfume shop",
      "perfume",
      "shop",
      "perfume software",
      "perfume app",
      "perfume platform",
      "perfume system",
      "perfume management",
      "retail perfume"
  ],

  synonyms: [
      "Perfume Shop platform",
      "Perfume Shop software",
      "Perfume Shop system",
      "perfume solution",
      "perfume service"
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
      "Build a perfume shop platform",
      "Create a perfume shop app",
      "I need a perfume shop management system",
      "Build a perfume shop solution",
      "Create a perfume shop booking system"
  ],
};
