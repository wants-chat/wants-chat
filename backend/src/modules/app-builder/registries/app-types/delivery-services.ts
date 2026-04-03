/**
 * Delivery Services App Type Definition
 *
 * Complete definition for delivery services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DELIVERY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'delivery-services',
  name: 'Delivery Services',
  category: 'logistics',
  description: 'Delivery Services platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "delivery services",
      "delivery",
      "services",
      "delivery software",
      "delivery app",
      "delivery platform",
      "delivery system",
      "delivery management",
      "logistics delivery"
  ],

  synonyms: [
      "Delivery Services platform",
      "Delivery Services software",
      "Delivery Services system",
      "delivery solution",
      "delivery service"
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
      "Build a delivery services platform",
      "Create a delivery services app",
      "I need a delivery services management system",
      "Build a delivery services solution",
      "Create a delivery services booking system"
  ],
};
