/**
 * Hydroponics App Type Definition
 *
 * Complete definition for hydroponics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HYDROPONICS_APP_TYPE: AppTypeDefinition = {
  id: 'hydroponics',
  name: 'Hydroponics',
  category: 'services',
  description: 'Hydroponics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "hydroponics",
      "hydroponics software",
      "hydroponics app",
      "hydroponics platform",
      "hydroponics system",
      "hydroponics management",
      "services hydroponics"
  ],

  synonyms: [
      "Hydroponics platform",
      "Hydroponics software",
      "Hydroponics system",
      "hydroponics solution",
      "hydroponics service"
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
      "Build a hydroponics platform",
      "Create a hydroponics app",
      "I need a hydroponics management system",
      "Build a hydroponics solution",
      "Create a hydroponics booking system"
  ],
};
