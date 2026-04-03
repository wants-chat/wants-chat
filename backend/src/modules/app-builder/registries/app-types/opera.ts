/**
 * Opera App Type Definition
 *
 * Complete definition for opera applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OPERA_APP_TYPE: AppTypeDefinition = {
  id: 'opera',
  name: 'Opera',
  category: 'services',
  description: 'Opera platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "opera",
      "opera software",
      "opera app",
      "opera platform",
      "opera system",
      "opera management",
      "services opera"
  ],

  synonyms: [
      "Opera platform",
      "Opera software",
      "Opera system",
      "opera solution",
      "opera service"
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
      "Build a opera platform",
      "Create a opera app",
      "I need a opera management system",
      "Build a opera solution",
      "Create a opera booking system"
  ],
};
