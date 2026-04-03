/**
 * Typesetting App Type Definition
 *
 * Complete definition for typesetting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TYPESETTING_APP_TYPE: AppTypeDefinition = {
  id: 'typesetting',
  name: 'Typesetting',
  category: 'services',
  description: 'Typesetting platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "typesetting",
      "typesetting software",
      "typesetting app",
      "typesetting platform",
      "typesetting system",
      "typesetting management",
      "services typesetting"
  ],

  synonyms: [
      "Typesetting platform",
      "Typesetting software",
      "Typesetting system",
      "typesetting solution",
      "typesetting service"
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
      "Build a typesetting platform",
      "Create a typesetting app",
      "I need a typesetting management system",
      "Build a typesetting solution",
      "Create a typesetting booking system"
  ],
};
