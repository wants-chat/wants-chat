/**
 * Temp Agency App Type Definition
 *
 * Complete definition for temp agency applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMP_AGENCY_APP_TYPE: AppTypeDefinition = {
  id: 'temp-agency',
  name: 'Temp Agency',
  category: 'services',
  description: 'Temp Agency platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "temp agency",
      "temp",
      "agency",
      "temp software",
      "temp app",
      "temp platform",
      "temp system",
      "temp management",
      "services temp"
  ],

  synonyms: [
      "Temp Agency platform",
      "Temp Agency software",
      "Temp Agency system",
      "temp solution",
      "temp service"
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
      "Build a temp agency platform",
      "Create a temp agency app",
      "I need a temp agency management system",
      "Build a temp agency solution",
      "Create a temp agency booking system"
  ],
};
