/**
 * Shipping Services App Type Definition
 *
 * Complete definition for shipping services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SHIPPING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'shipping-services',
  name: 'Shipping Services',
  category: 'logistics',
  description: 'Shipping Services platform with comprehensive management features',
  icon: 'package',

  keywords: [
      "shipping services",
      "shipping",
      "services",
      "shipping software",
      "shipping app",
      "shipping platform",
      "shipping system",
      "shipping management",
      "logistics shipping"
  ],

  synonyms: [
      "Shipping Services platform",
      "Shipping Services software",
      "Shipping Services system",
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
      "Build a shipping services platform",
      "Create a shipping services app",
      "I need a shipping services management system",
      "Build a shipping services solution",
      "Create a shipping services booking system"
  ],
};
