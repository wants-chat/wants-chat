/**
 * Assisted Living App Type Definition
 *
 * Complete definition for assisted living applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASSISTED_LIVING_APP_TYPE: AppTypeDefinition = {
  id: 'assisted-living',
  name: 'Assisted Living',
  category: 'services',
  description: 'Assisted Living platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "assisted living",
      "assisted",
      "living",
      "assisted software",
      "assisted app",
      "assisted platform",
      "assisted system",
      "assisted management",
      "services assisted"
  ],

  synonyms: [
      "Assisted Living platform",
      "Assisted Living software",
      "Assisted Living system",
      "assisted solution",
      "assisted service"
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
      "Build a assisted living platform",
      "Create a assisted living app",
      "I need a assisted living management system",
      "Build a assisted living solution",
      "Create a assisted living booking system"
  ],
};
