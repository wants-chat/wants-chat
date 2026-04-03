/**
 * Auto Registration App Type Definition
 *
 * Complete definition for auto registration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTO_REGISTRATION_APP_TYPE: AppTypeDefinition = {
  id: 'auto-registration',
  name: 'Auto Registration',
  category: 'automotive',
  description: 'Auto Registration platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "auto registration",
      "auto",
      "registration",
      "auto software",
      "auto app",
      "auto platform",
      "auto system",
      "auto management",
      "automotive auto"
  ],

  synonyms: [
      "Auto Registration platform",
      "Auto Registration software",
      "Auto Registration system",
      "auto solution",
      "auto service"
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
      "service-scheduling",
      "appointments",
      "parts-catalog",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "vehicle-history",
      "payments",
      "reviews",
      "inventory",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a auto registration platform",
      "Create a auto registration app",
      "I need a auto registration management system",
      "Build a auto registration solution",
      "Create a auto registration booking system"
  ],
};
