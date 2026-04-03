/**
 * Tuck Pointing App Type Definition
 *
 * Complete definition for tuck pointing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TUCK_POINTING_APP_TYPE: AppTypeDefinition = {
  id: 'tuck-pointing',
  name: 'Tuck Pointing',
  category: 'services',
  description: 'Tuck Pointing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "tuck pointing",
      "tuck",
      "pointing",
      "tuck software",
      "tuck app",
      "tuck platform",
      "tuck system",
      "tuck management",
      "services tuck"
  ],

  synonyms: [
      "Tuck Pointing platform",
      "Tuck Pointing software",
      "Tuck Pointing system",
      "tuck solution",
      "tuck service"
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
      "Build a tuck pointing platform",
      "Create a tuck pointing app",
      "I need a tuck pointing management system",
      "Build a tuck pointing solution",
      "Create a tuck pointing booking system"
  ],
};
