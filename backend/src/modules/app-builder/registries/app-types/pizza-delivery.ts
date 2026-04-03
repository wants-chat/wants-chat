/**
 * Pizza Delivery App Type Definition
 *
 * Complete definition for pizza delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PIZZA_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'pizza-delivery',
  name: 'Pizza Delivery',
  category: 'logistics',
  description: 'Pizza Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "pizza delivery",
      "pizza",
      "delivery",
      "pizza software",
      "pizza app",
      "pizza platform",
      "pizza system",
      "pizza management",
      "logistics pizza"
  ],

  synonyms: [
      "Pizza Delivery platform",
      "Pizza Delivery software",
      "Pizza Delivery system",
      "pizza solution",
      "pizza service"
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
      "Build a pizza delivery platform",
      "Create a pizza delivery app",
      "I need a pizza delivery management system",
      "Build a pizza delivery solution",
      "Create a pizza delivery booking system"
  ],
};
