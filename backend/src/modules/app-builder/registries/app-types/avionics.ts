/**
 * Avionics App Type Definition
 *
 * Complete definition for avionics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIONICS_APP_TYPE: AppTypeDefinition = {
  id: 'avionics',
  name: 'Avionics',
  category: 'services',
  description: 'Avionics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "avionics",
      "avionics software",
      "avionics app",
      "avionics platform",
      "avionics system",
      "avionics management",
      "services avionics"
  ],

  synonyms: [
      "Avionics platform",
      "Avionics software",
      "Avionics system",
      "avionics solution",
      "avionics service"
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
      "Build a avionics platform",
      "Create a avionics app",
      "I need a avionics management system",
      "Build a avionics solution",
      "Create a avionics booking system"
  ],
};
