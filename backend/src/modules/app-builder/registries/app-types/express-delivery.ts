/**
 * Express Delivery App Type Definition
 *
 * Complete definition for express delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXPRESS_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'express-delivery',
  name: 'Express Delivery',
  category: 'logistics',
  description: 'Express Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "express delivery",
      "express",
      "delivery",
      "express software",
      "express app",
      "express platform",
      "express system",
      "express management",
      "logistics express"
  ],

  synonyms: [
      "Express Delivery platform",
      "Express Delivery software",
      "Express Delivery system",
      "express solution",
      "express service"
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
      "Build a express delivery platform",
      "Create a express delivery app",
      "I need a express delivery management system",
      "Build a express delivery solution",
      "Create a express delivery booking system"
  ],
};
