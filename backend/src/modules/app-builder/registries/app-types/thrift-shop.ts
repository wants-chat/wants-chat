/**
 * Thrift Shop App Type Definition
 *
 * Complete definition for thrift shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THRIFT_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'thrift-shop',
  name: 'Thrift Shop',
  category: 'retail',
  description: 'Thrift Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "thrift shop",
      "thrift",
      "shop",
      "thrift software",
      "thrift app",
      "thrift platform",
      "thrift system",
      "thrift management",
      "retail thrift"
  ],

  synonyms: [
      "Thrift Shop platform",
      "Thrift Shop software",
      "Thrift Shop system",
      "thrift solution",
      "thrift service"
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
      "Build a thrift shop platform",
      "Create a thrift shop app",
      "I need a thrift shop management system",
      "Build a thrift shop solution",
      "Create a thrift shop booking system"
  ],
};
