/**
 * Lunch Delivery App Type Definition
 *
 * Complete definition for lunch delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LUNCH_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'lunch-delivery',
  name: 'Lunch Delivery',
  category: 'logistics',
  description: 'Lunch Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "lunch delivery",
      "lunch",
      "delivery",
      "lunch software",
      "lunch app",
      "lunch platform",
      "lunch system",
      "lunch management",
      "logistics lunch"
  ],

  synonyms: [
      "Lunch Delivery platform",
      "Lunch Delivery software",
      "Lunch Delivery system",
      "lunch solution",
      "lunch service"
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
      "Build a lunch delivery platform",
      "Create a lunch delivery app",
      "I need a lunch delivery management system",
      "Build a lunch delivery solution",
      "Create a lunch delivery booking system"
  ],
};
