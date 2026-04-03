/**
 * Local Delivery App Type Definition
 *
 * Complete definition for local delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LOCAL_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'local-delivery',
  name: 'Local Delivery',
  category: 'logistics',
  description: 'Local Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "local delivery",
      "local",
      "delivery",
      "local software",
      "local app",
      "local platform",
      "local system",
      "local management",
      "logistics local"
  ],

  synonyms: [
      "Local Delivery platform",
      "Local Delivery software",
      "Local Delivery system",
      "local solution",
      "local service"
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
      "Build a local delivery platform",
      "Create a local delivery app",
      "I need a local delivery management system",
      "Build a local delivery solution",
      "Create a local delivery booking system"
  ],
};
