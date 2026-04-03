/**
 * Rush Delivery App Type Definition
 *
 * Complete definition for rush delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RUSH_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'rush-delivery',
  name: 'Rush Delivery',
  category: 'logistics',
  description: 'Rush Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "rush delivery",
      "rush",
      "delivery",
      "rush software",
      "rush app",
      "rush platform",
      "rush system",
      "rush management",
      "logistics rush"
  ],

  synonyms: [
      "Rush Delivery platform",
      "Rush Delivery software",
      "Rush Delivery system",
      "rush solution",
      "rush service"
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
      "Build a rush delivery platform",
      "Create a rush delivery app",
      "I need a rush delivery management system",
      "Build a rush delivery solution",
      "Create a rush delivery booking system"
  ],
};
