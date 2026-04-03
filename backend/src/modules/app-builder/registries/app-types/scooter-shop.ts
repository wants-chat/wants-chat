/**
 * Scooter Shop App Type Definition
 *
 * Complete definition for scooter shop applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCOOTER_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'scooter-shop',
  name: 'Scooter Shop',
  category: 'retail',
  description: 'Scooter Shop platform with comprehensive management features',
  icon: 'store',

  keywords: [
      "scooter shop",
      "scooter",
      "shop",
      "scooter software",
      "scooter app",
      "scooter platform",
      "scooter system",
      "scooter management",
      "retail scooter"
  ],

  synonyms: [
      "Scooter Shop platform",
      "Scooter Shop software",
      "Scooter Shop system",
      "scooter solution",
      "scooter service"
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
      "Build a scooter shop platform",
      "Create a scooter shop app",
      "I need a scooter shop management system",
      "Build a scooter shop solution",
      "Create a scooter shop booking system"
  ],
};
