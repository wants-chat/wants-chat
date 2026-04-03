/**
 * Machine Shop App Type Definition
 *
 * Complete definition for machine shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MACHINE_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'machine-shop',
  name: 'Machine Shop',
  category: 'retail',
  description: 'Machine Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "machine shop",
      "machine",
      "shop",
      "machine software",
      "machine app",
      "machine platform",
      "machine system",
      "machine management",
      "retail machine"
  ],

  synonyms: [
      "Machine Shop platform",
      "Machine Shop software",
      "Machine Shop system",
      "machine solution",
      "machine service"
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
      "Build a machine shop platform",
      "Create a machine shop app",
      "I need a machine shop management system",
      "Build a machine shop solution",
      "Create a machine shop booking system"
  ],
};
