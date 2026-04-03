/**
 * Aerobics Studio App Type Definition
 *
 * Complete definition for aerobics studio applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AEROBICS_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'aerobics-studio',
  name: 'Aerobics Studio',
  category: 'services',
  description: 'Aerobics Studio platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aerobics studio",
      "aerobics",
      "studio",
      "aerobics software",
      "aerobics app",
      "aerobics platform",
      "aerobics system",
      "aerobics management",
      "services aerobics"
  ],

  synonyms: [
      "Aerobics Studio platform",
      "Aerobics Studio software",
      "Aerobics Studio system",
      "aerobics solution",
      "aerobics service"
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
      "Build a aerobics studio platform",
      "Create a aerobics studio app",
      "I need a aerobics studio management system",
      "Build a aerobics studio solution",
      "Create a aerobics studio booking system"
  ],
};
