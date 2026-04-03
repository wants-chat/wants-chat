/**
 * Flower Delivery App Type Definition
 *
 * Complete definition for flower delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FLOWER_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'flower-delivery',
  name: 'Flower Delivery',
  category: 'logistics',
  description: 'Flower Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "flower delivery",
      "flower",
      "delivery",
      "flower software",
      "flower app",
      "flower platform",
      "flower system",
      "flower management",
      "logistics flower"
  ],

  synonyms: [
      "Flower Delivery platform",
      "Flower Delivery software",
      "Flower Delivery system",
      "flower solution",
      "flower service"
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
      "orders",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "proof-of-delivery",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'logistics',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a flower delivery platform",
      "Create a flower delivery app",
      "I need a flower delivery management system",
      "Build a flower delivery solution",
      "Create a flower delivery booking system"
  ],
};
