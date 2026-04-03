/**
 * Alcohol Delivery App Type Definition
 *
 * Complete definition for alcohol delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALCOHOL_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'alcohol-delivery',
  name: 'Alcohol Delivery',
  category: 'logistics',
  description: 'Alcohol Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "alcohol delivery",
      "alcohol",
      "delivery",
      "alcohol software",
      "alcohol app",
      "alcohol platform",
      "alcohol system",
      "alcohol management",
      "logistics alcohol"
  ],

  synonyms: [
      "Alcohol Delivery platform",
      "Alcohol Delivery software",
      "Alcohol Delivery system",
      "alcohol solution",
      "alcohol service"
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
      "Build a alcohol delivery platform",
      "Create a alcohol delivery app",
      "I need a alcohol delivery management system",
      "Build a alcohol delivery solution",
      "Create a alcohol delivery booking system"
  ],
};
