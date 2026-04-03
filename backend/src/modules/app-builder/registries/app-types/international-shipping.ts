/**
 * International Shipping App Type Definition
 *
 * Complete definition for international shipping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INTERNATIONAL_SHIPPING_APP_TYPE: AppTypeDefinition = {
  id: 'international-shipping',
  name: 'International Shipping',
  category: 'logistics',
  description: 'International Shipping platform with comprehensive management features',
  icon: 'package',

  keywords: [
      "international shipping",
      "international",
      "shipping",
      "international software",
      "international app",
      "international platform",
      "international system",
      "international management",
      "logistics international"
  ],

  synonyms: [
      "International Shipping platform",
      "International Shipping software",
      "International Shipping system",
      "international solution",
      "international service"
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
      "Build a international shipping platform",
      "Create a international shipping app",
      "I need a international shipping management system",
      "Build a international shipping solution",
      "Create a international shipping booking system"
  ],
};
