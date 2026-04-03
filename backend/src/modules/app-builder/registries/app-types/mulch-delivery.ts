/**
 * Mulch Delivery App Type Definition
 *
 * Complete definition for mulch delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MULCH_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'mulch-delivery',
  name: 'Mulch Delivery',
  category: 'logistics',
  description: 'Mulch Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "mulch delivery",
      "mulch",
      "delivery",
      "mulch software",
      "mulch app",
      "mulch platform",
      "mulch system",
      "mulch management",
      "logistics mulch"
  ],

  synonyms: [
      "Mulch Delivery platform",
      "Mulch Delivery software",
      "Mulch Delivery system",
      "mulch solution",
      "mulch service"
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
      "Build a mulch delivery platform",
      "Create a mulch delivery app",
      "I need a mulch delivery management system",
      "Build a mulch delivery solution",
      "Create a mulch delivery booking system"
  ],
};
