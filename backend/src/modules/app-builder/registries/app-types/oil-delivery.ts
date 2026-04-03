/**
 * Oil Delivery App Type Definition
 *
 * Complete definition for oil delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OIL_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'oil-delivery',
  name: 'Oil Delivery',
  category: 'logistics',
  description: 'Oil Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "oil delivery",
      "oil",
      "delivery",
      "oil software",
      "oil app",
      "oil platform",
      "oil system",
      "oil management",
      "logistics oil"
  ],

  synonyms: [
      "Oil Delivery platform",
      "Oil Delivery software",
      "Oil Delivery system",
      "oil solution",
      "oil service"
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
      "Build a oil delivery platform",
      "Create a oil delivery app",
      "I need a oil delivery management system",
      "Build a oil delivery solution",
      "Create a oil delivery booking system"
  ],
};
