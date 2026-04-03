/**
 * Milk Delivery App Type Definition
 *
 * Complete definition for milk delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MILK_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'milk-delivery',
  name: 'Milk Delivery',
  category: 'logistics',
  description: 'Milk Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "milk delivery",
      "milk",
      "delivery",
      "milk software",
      "milk app",
      "milk platform",
      "milk system",
      "milk management",
      "logistics milk"
  ],

  synonyms: [
      "Milk Delivery platform",
      "Milk Delivery software",
      "Milk Delivery system",
      "milk solution",
      "milk service"
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
      "Build a milk delivery platform",
      "Create a milk delivery app",
      "I need a milk delivery management system",
      "Build a milk delivery solution",
      "Create a milk delivery booking system"
  ],
};
