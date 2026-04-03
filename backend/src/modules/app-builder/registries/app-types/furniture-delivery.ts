/**
 * Furniture Delivery App Type Definition
 *
 * Complete definition for furniture delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-delivery',
  name: 'Furniture Delivery',
  category: 'logistics',
  description: 'Furniture Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "furniture delivery",
      "furniture",
      "delivery",
      "furniture software",
      "furniture app",
      "furniture platform",
      "furniture system",
      "furniture management",
      "logistics furniture"
  ],

  synonyms: [
      "Furniture Delivery platform",
      "Furniture Delivery software",
      "Furniture Delivery system",
      "furniture solution",
      "furniture service"
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
      "Build a furniture delivery platform",
      "Create a furniture delivery app",
      "I need a furniture delivery management system",
      "Build a furniture delivery solution",
      "Create a furniture delivery booking system"
  ],
};
