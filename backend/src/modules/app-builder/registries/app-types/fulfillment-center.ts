/**
 * Fulfillment Center App Type Definition
 *
 * Complete definition for fulfillment center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FULFILLMENT_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'fulfillment-center',
  name: 'Fulfillment Center',
  category: 'services',
  description: 'Fulfillment Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "fulfillment center",
      "fulfillment",
      "center",
      "fulfillment software",
      "fulfillment app",
      "fulfillment platform",
      "fulfillment system",
      "fulfillment management",
      "services fulfillment"
  ],

  synonyms: [
      "Fulfillment Center platform",
      "Fulfillment Center software",
      "Fulfillment Center system",
      "fulfillment solution",
      "fulfillment service"
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a fulfillment center platform",
      "Create a fulfillment center app",
      "I need a fulfillment center management system",
      "Build a fulfillment center solution",
      "Create a fulfillment center booking system"
  ],
};
