/**
 * Aquaponics App Type Definition
 *
 * Complete definition for aquaponics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUAPONICS_APP_TYPE: AppTypeDefinition = {
  id: 'aquaponics',
  name: 'Aquaponics',
  category: 'services',
  description: 'Aquaponics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aquaponics",
      "aquaponics software",
      "aquaponics app",
      "aquaponics platform",
      "aquaponics system",
      "aquaponics management",
      "services aquaponics"
  ],

  synonyms: [
      "Aquaponics platform",
      "Aquaponics software",
      "Aquaponics system",
      "aquaponics solution",
      "aquaponics service"
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
      "Build a aquaponics platform",
      "Create a aquaponics app",
      "I need a aquaponics management system",
      "Build a aquaponics solution",
      "Create a aquaponics booking system"
  ],
};
