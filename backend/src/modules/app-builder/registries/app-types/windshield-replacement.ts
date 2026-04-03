/**
 * Windshield Replacement App Type Definition
 *
 * Complete definition for windshield replacement applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINDSHIELD_REPLACEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'windshield-replacement',
  name: 'Windshield Replacement',
  category: 'services',
  description: 'Windshield Replacement platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "windshield replacement",
      "windshield",
      "replacement",
      "windshield software",
      "windshield app",
      "windshield platform",
      "windshield system",
      "windshield management",
      "services windshield"
  ],

  synonyms: [
      "Windshield Replacement platform",
      "Windshield Replacement software",
      "Windshield Replacement system",
      "windshield solution",
      "windshield service"
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
      "Build a windshield replacement platform",
      "Create a windshield replacement app",
      "I need a windshield replacement management system",
      "Build a windshield replacement solution",
      "Create a windshield replacement booking system"
  ],
};
