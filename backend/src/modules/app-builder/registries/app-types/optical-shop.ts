/**
 * Optical Shop App Type Definition
 *
 * Complete definition for optical shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPTICAL_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'optical-shop',
  name: 'Optical Shop',
  category: 'retail',
  description: 'Optical Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "optical shop",
      "optical",
      "shop",
      "optical software",
      "optical app",
      "optical platform",
      "optical system",
      "optical management",
      "retail optical"
  ],

  synonyms: [
      "Optical Shop platform",
      "Optical Shop software",
      "Optical Shop system",
      "optical solution",
      "optical service"
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
      "Build a optical shop platform",
      "Create a optical shop app",
      "I need a optical shop management system",
      "Build a optical shop solution",
      "Create a optical shop booking system"
  ],
};
