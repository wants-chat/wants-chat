/**
 * Qa Testing App Type Definition
 *
 * Complete definition for qa testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const QA_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'qa-testing',
  name: 'Qa Testing',
  category: 'services',
  description: 'Qa Testing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "qa testing",
      "testing",
      "qa software",
      "qa app",
      "qa platform",
      "qa system",
      "qa management",
      "services qa"
  ],

  synonyms: [
      "Qa Testing platform",
      "Qa Testing software",
      "Qa Testing system",
      "qa solution",
      "qa service"
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
      "Build a qa testing platform",
      "Create a qa testing app",
      "I need a qa testing management system",
      "Build a qa testing solution",
      "Create a qa testing booking system"
  ],
};
