/**
 * Prescription Delivery App Type Definition
 *
 * Complete definition for prescription delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRESCRIPTION_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'prescription-delivery',
  name: 'Prescription Delivery',
  category: 'logistics',
  description: 'Prescription Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "prescription delivery",
      "prescription",
      "delivery",
      "prescription software",
      "prescription app",
      "prescription platform",
      "prescription system",
      "prescription management",
      "logistics prescription"
  ],

  synonyms: [
      "Prescription Delivery platform",
      "Prescription Delivery software",
      "Prescription Delivery system",
      "prescription solution",
      "prescription service"
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
      "Build a prescription delivery platform",
      "Create a prescription delivery app",
      "I need a prescription delivery management system",
      "Build a prescription delivery solution",
      "Create a prescription delivery booking system"
  ],
};
