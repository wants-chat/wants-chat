/**
 * Wedding Shop App Type Definition
 *
 * Complete definition for wedding shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEDDING_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'wedding-shop',
  name: 'Wedding Shop',
  category: 'retail',
  description: 'Wedding Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "wedding shop",
      "wedding",
      "shop",
      "wedding software",
      "wedding app",
      "wedding platform",
      "wedding system",
      "wedding management",
      "retail wedding"
  ],

  synonyms: [
      "Wedding Shop platform",
      "Wedding Shop software",
      "Wedding Shop system",
      "wedding solution",
      "wedding service"
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
      "Build a wedding shop platform",
      "Create a wedding shop app",
      "I need a wedding shop management system",
      "Build a wedding shop solution",
      "Create a wedding shop booking system"
  ],
};
