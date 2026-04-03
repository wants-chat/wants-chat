/**
 * Water System App Type Definition
 *
 * Complete definition for water system applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_SYSTEM_APP_TYPE: AppTypeDefinition = {
  id: 'water-system',
  name: 'Water System',
  category: 'services',
  description: 'Water System platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "water system",
      "water",
      "system",
      "water software",
      "water app",
      "water platform",
      "water management",
      "services water"
  ],

  synonyms: [
      "Water System platform",
      "Water System software",
      "Water System system",
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
      "Build a water system platform",
      "Create a water system app",
      "I need a water system management system",
      "Build a water system solution",
      "Create a water system booking system"
  ],
};
