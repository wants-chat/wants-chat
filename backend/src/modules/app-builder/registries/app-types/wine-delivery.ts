/**
 * Wine Delivery App Type Definition
 *
 * Complete definition for wine delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'wine-delivery',
  name: 'Wine Delivery',
  category: 'logistics',
  description: 'Wine Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "wine delivery",
      "wine",
      "delivery",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "logistics wine"
  ],

  synonyms: [
      "Wine Delivery platform",
      "Wine Delivery software",
      "Wine Delivery system",
      "wine solution",
      "wine service"
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
      "Build a wine delivery platform",
      "Create a wine delivery app",
      "I need a wine delivery management system",
      "Build a wine delivery solution",
      "Create a wine delivery booking system"
  ],
};
