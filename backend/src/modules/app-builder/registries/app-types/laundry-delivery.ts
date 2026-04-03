/**
 * Laundry Delivery App Type Definition
 *
 * Complete definition for laundry delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LAUNDRY_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'laundry-delivery',
  name: 'Laundry Delivery',
  category: 'logistics',
  description: 'Laundry Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "laundry delivery",
      "laundry",
      "delivery",
      "laundry software",
      "laundry app",
      "laundry platform",
      "laundry system",
      "laundry management",
      "logistics laundry"
  ],

  synonyms: [
      "Laundry Delivery platform",
      "Laundry Delivery software",
      "Laundry Delivery system",
      "laundry solution",
      "laundry service"
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
      "Build a laundry delivery platform",
      "Create a laundry delivery app",
      "I need a laundry delivery management system",
      "Build a laundry delivery solution",
      "Create a laundry delivery booking system"
  ],
};
