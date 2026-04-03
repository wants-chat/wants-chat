/**
 * Same Day Delivery App Type Definition
 *
 * Complete definition for same day delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SAME_DAY_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'same-day-delivery',
  name: 'Same Day Delivery',
  category: 'logistics',
  description: 'Same Day Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "same day delivery",
      "same",
      "day",
      "delivery",
      "same software",
      "same app",
      "same platform",
      "same system",
      "same management",
      "logistics same"
  ],

  synonyms: [
      "Same Day Delivery platform",
      "Same Day Delivery software",
      "Same Day Delivery system",
      "same solution",
      "same service"
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
      "Build a same day delivery platform",
      "Create a same day delivery app",
      "I need a same day delivery management system",
      "Build a same day delivery solution",
      "Create a same day delivery booking system"
  ],
};
