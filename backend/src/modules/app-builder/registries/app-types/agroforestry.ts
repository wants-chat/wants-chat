/**
 * Agroforestry App Type Definition
 *
 * Complete definition for agroforestry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGROFORESTRY_APP_TYPE: AppTypeDefinition = {
  id: 'agroforestry',
  name: 'Agroforestry',
  category: 'services',
  description: 'Agroforestry platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "agroforestry",
      "agroforestry software",
      "agroforestry app",
      "agroforestry platform",
      "agroforestry system",
      "agroforestry management",
      "services agroforestry"
  ],

  synonyms: [
      "Agroforestry platform",
      "Agroforestry software",
      "Agroforestry system",
      "agroforestry solution",
      "agroforestry service"
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
      "Build a agroforestry platform",
      "Create a agroforestry app",
      "I need a agroforestry management system",
      "Build a agroforestry solution",
      "Create a agroforestry booking system"
  ],
};
