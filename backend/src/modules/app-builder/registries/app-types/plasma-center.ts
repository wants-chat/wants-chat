/**
 * Plasma Center App Type Definition
 *
 * Complete definition for plasma center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PLASMA_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'plasma-center',
  name: 'Plasma Center',
  category: 'services',
  description: 'Plasma Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "plasma center",
      "plasma",
      "center",
      "plasma software",
      "plasma app",
      "plasma platform",
      "plasma system",
      "plasma management",
      "services plasma"
  ],

  synonyms: [
      "Plasma Center platform",
      "Plasma Center software",
      "Plasma Center system",
      "plasma solution",
      "plasma service"
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
      "Build a plasma center platform",
      "Create a plasma center app",
      "I need a plasma center management system",
      "Build a plasma center solution",
      "Create a plasma center booking system"
  ],
};
