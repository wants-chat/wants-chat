/**
 * Softball App Type Definition
 *
 * Complete definition for softball applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTBALL_APP_TYPE: AppTypeDefinition = {
  id: 'softball',
  name: 'Softball',
  category: 'services',
  description: 'Softball platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "softball",
      "softball software",
      "softball app",
      "softball platform",
      "softball system",
      "softball management",
      "services softball"
  ],

  synonyms: [
      "Softball platform",
      "Softball software",
      "Softball system",
      "softball solution",
      "softball service"
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
      "Build a softball platform",
      "Create a softball app",
      "I need a softball management system",
      "Build a softball solution",
      "Create a softball booking system"
  ],
};
