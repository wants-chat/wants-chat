/**
 * Telecommunications App Type Definition
 *
 * Complete definition for telecommunications applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELECOMMUNICATIONS_APP_TYPE: AppTypeDefinition = {
  id: 'telecommunications',
  name: 'Telecommunications',
  category: 'services',
  description: 'Telecommunications platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "telecommunications",
      "telecommunications software",
      "telecommunications app",
      "telecommunications platform",
      "telecommunications system",
      "telecommunications management",
      "services telecommunications"
  ],

  synonyms: [
      "Telecommunications platform",
      "Telecommunications software",
      "Telecommunications system",
      "telecommunications solution",
      "telecommunications service"
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
      "Build a telecommunications platform",
      "Create a telecommunications app",
      "I need a telecommunications management system",
      "Build a telecommunications solution",
      "Create a telecommunications booking system"
  ],
};
