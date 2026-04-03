/**
 * Pickup Delivery App Type Definition
 *
 * Complete definition for pickup delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PICKUP_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'pickup-delivery',
  name: 'Pickup Delivery',
  category: 'logistics',
  description: 'Pickup Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "pickup delivery",
      "pickup",
      "delivery",
      "pickup software",
      "pickup app",
      "pickup platform",
      "pickup system",
      "pickup management",
      "logistics pickup"
  ],

  synonyms: [
      "Pickup Delivery platform",
      "Pickup Delivery software",
      "Pickup Delivery system",
      "pickup solution",
      "pickup service"
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
      "Build a pickup delivery platform",
      "Create a pickup delivery app",
      "I need a pickup delivery management system",
      "Build a pickup delivery solution",
      "Create a pickup delivery booking system"
  ],
};
