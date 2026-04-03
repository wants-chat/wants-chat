/**
 * Shipping Center App Type Definition
 *
 * Complete definition for shipping center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIPPING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'shipping-center',
  name: 'Shipping Center',
  category: 'logistics',
  description: 'Shipping Center platform with comprehensive management features',
  icon: 'package',

  keywords: [
      "shipping center",
      "shipping",
      "center",
      "shipping software",
      "shipping app",
      "shipping platform",
      "shipping system",
      "shipping management",
      "logistics shipping"
  ],

  synonyms: [
      "Shipping Center platform",
      "Shipping Center software",
      "Shipping Center system",
      "shipping solution",
      "shipping service"
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
      "shipment-tracking",
      "orders",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "carrier-integration",
      "proof-of-delivery",
      "payments",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a shipping center platform",
      "Create a shipping center app",
      "I need a shipping center management system",
      "Build a shipping center solution",
      "Create a shipping center booking system"
  ],
};
