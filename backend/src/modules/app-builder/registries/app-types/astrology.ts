/**
 * Astrology App Type Definition
 *
 * Complete definition for astrology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ASTROLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'astrology',
  name: 'Astrology',
  category: 'services',
  description: 'Astrology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "astrology",
      "astrology software",
      "astrology app",
      "astrology platform",
      "astrology system",
      "astrology management",
      "services astrology"
  ],

  synonyms: [
      "Astrology platform",
      "Astrology software",
      "Astrology system",
      "astrology solution",
      "astrology service"
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
      "Build a astrology platform",
      "Create a astrology app",
      "I need a astrology management system",
      "Build a astrology solution",
      "Create a astrology booking system"
  ],
};
