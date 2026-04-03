/**
 * Home Delivery App Type Definition
 *
 * Complete definition for home delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'home-delivery',
  name: 'Home Delivery',
  category: 'logistics',
  description: 'Home Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "home delivery",
      "home",
      "delivery",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "logistics home"
  ],

  synonyms: [
      "Home Delivery platform",
      "Home Delivery software",
      "Home Delivery system",
      "home solution",
      "home service"
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
      "Build a home delivery platform",
      "Create a home delivery app",
      "I need a home delivery management system",
      "Build a home delivery solution",
      "Create a home delivery booking system"
  ],
};
