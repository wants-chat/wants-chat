/**
 * Fruit Delivery App Type Definition
 *
 * Complete definition for fruit delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FRUIT_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'fruit-delivery',
  name: 'Fruit Delivery',
  category: 'logistics',
  description: 'Fruit Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "fruit delivery",
      "fruit",
      "delivery",
      "fruit software",
      "fruit app",
      "fruit platform",
      "fruit system",
      "fruit management",
      "logistics fruit"
  ],

  synonyms: [
      "Fruit Delivery platform",
      "Fruit Delivery software",
      "Fruit Delivery system",
      "fruit solution",
      "fruit service"
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
      "Build a fruit delivery platform",
      "Create a fruit delivery app",
      "I need a fruit delivery management system",
      "Build a fruit delivery solution",
      "Create a fruit delivery booking system"
  ],
};
