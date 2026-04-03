/**
 * Water Delivery App Type Definition
 *
 * Complete definition for water delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'water-delivery',
  name: 'Water Delivery',
  category: 'logistics',
  description: 'Water Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "water delivery",
      "water",
      "delivery",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "logistics water"
  ],

  synonyms: [
      "Water Delivery platform",
      "Water Delivery software",
      "Water Delivery system",
      "water solution",
      "water service"
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
      "Build a water delivery platform",
      "Create a water delivery app",
      "I need a water delivery management system",
      "Build a water delivery solution",
      "Create a water delivery booking system"
  ],
};
