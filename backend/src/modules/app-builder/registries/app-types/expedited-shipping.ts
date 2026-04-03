/**
 * Expedited Shipping App Type Definition
 *
 * Complete definition for expedited shipping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EXPEDITED_SHIPPING_APP_TYPE: AppTypeDefinition = {
  id: 'expedited-shipping',
  name: 'Expedited Shipping',
  category: 'logistics',
  description: 'Expedited Shipping platform with comprehensive management features',
  icon: 'package',

  keywords: [
      "expedited shipping",
      "expedited",
      "shipping",
      "expedited software",
      "expedited app",
      "expedited platform",
      "expedited system",
      "expedited management",
      "logistics expedited"
  ],

  synonyms: [
      "Expedited Shipping platform",
      "Expedited Shipping software",
      "Expedited Shipping system",
      "expedited solution",
      "expedited service"
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
      "Build a expedited shipping platform",
      "Create a expedited shipping app",
      "I need a expedited shipping management system",
      "Build a expedited shipping solution",
      "Create a expedited shipping booking system"
  ],
};
