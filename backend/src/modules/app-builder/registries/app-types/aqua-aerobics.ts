/**
 * Aqua Aerobics App Type Definition
 *
 * Complete definition for aqua aerobics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUA_AEROBICS_APP_TYPE: AppTypeDefinition = {
  id: 'aqua-aerobics',
  name: 'Aqua Aerobics',
  category: 'services',
  description: 'Aqua Aerobics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aqua aerobics",
      "aqua",
      "aerobics",
      "aqua software",
      "aqua app",
      "aqua platform",
      "aqua system",
      "aqua management",
      "services aqua"
  ],

  synonyms: [
      "Aqua Aerobics platform",
      "Aqua Aerobics software",
      "Aqua Aerobics system",
      "aqua solution",
      "aqua service"
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
      "Build a aqua aerobics platform",
      "Create a aqua aerobics app",
      "I need a aqua aerobics management system",
      "Build a aqua aerobics solution",
      "Create a aqua aerobics booking system"
  ],
};
