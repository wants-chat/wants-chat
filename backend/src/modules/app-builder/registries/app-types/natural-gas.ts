/**
 * Natural Gas App Type Definition
 *
 * Complete definition for natural gas applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NATURAL_GAS_APP_TYPE: AppTypeDefinition = {
  id: 'natural-gas',
  name: 'Natural Gas',
  category: 'services',
  description: 'Natural Gas platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "natural gas",
      "natural",
      "gas",
      "natural software",
      "natural app",
      "natural platform",
      "natural system",
      "natural management",
      "services natural"
  ],

  synonyms: [
      "Natural Gas platform",
      "Natural Gas software",
      "Natural Gas system",
      "natural solution",
      "natural service"
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
      "Build a natural gas platform",
      "Create a natural gas app",
      "I need a natural gas management system",
      "Build a natural gas solution",
      "Create a natural gas booking system"
  ],
};
