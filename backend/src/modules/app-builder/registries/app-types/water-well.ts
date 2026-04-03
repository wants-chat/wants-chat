/**
 * Water Well App Type Definition
 *
 * Complete definition for water well applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_WELL_APP_TYPE: AppTypeDefinition = {
  id: 'water-well',
  name: 'Water Well',
  category: 'services',
  description: 'Water Well platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "water well",
      "water",
      "well",
      "water software",
      "water app",
      "water platform",
      "water system",
      "water management",
      "services water"
  ],

  synonyms: [
      "Water Well platform",
      "Water Well software",
      "Water Well system",
      "water solution",
      "water service"
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
      "Build a water well platform",
      "Create a water well app",
      "I need a water well management system",
      "Build a water well solution",
      "Create a water well booking system"
  ],
};
