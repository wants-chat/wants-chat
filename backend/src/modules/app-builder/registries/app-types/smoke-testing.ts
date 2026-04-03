/**
 * Smoke Testing App Type Definition
 *
 * Complete definition for smoke testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMOKE_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'smoke-testing',
  name: 'Smoke Testing',
  category: 'services',
  description: 'Smoke Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "smoke testing",
      "smoke",
      "testing",
      "smoke software",
      "smoke app",
      "smoke platform",
      "smoke system",
      "smoke management",
      "services smoke"
  ],

  synonyms: [
      "Smoke Testing platform",
      "Smoke Testing software",
      "Smoke Testing system",
      "smoke solution",
      "smoke service"
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
      "Build a smoke testing platform",
      "Create a smoke testing app",
      "I need a smoke testing management system",
      "Build a smoke testing solution",
      "Create a smoke testing booking system"
  ],
};
