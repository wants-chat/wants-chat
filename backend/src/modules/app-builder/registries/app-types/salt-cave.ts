/**
 * Salt Cave App Type Definition
 *
 * Complete definition for salt cave applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALT_CAVE_APP_TYPE: AppTypeDefinition = {
  id: 'salt-cave',
  name: 'Salt Cave',
  category: 'services',
  description: 'Salt Cave platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "salt cave",
      "salt",
      "cave",
      "salt software",
      "salt app",
      "salt platform",
      "salt system",
      "salt management",
      "services salt"
  ],

  synonyms: [
      "Salt Cave platform",
      "Salt Cave software",
      "Salt Cave system",
      "salt solution",
      "salt service"
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
      "Build a salt cave platform",
      "Create a salt cave app",
      "I need a salt cave management system",
      "Build a salt cave solution",
      "Create a salt cave booking system"
  ],
};
