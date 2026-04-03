/**
 * Theology App Type Definition
 *
 * Complete definition for theology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THEOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'theology',
  name: 'Theology',
  category: 'services',
  description: 'Theology platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "theology",
      "theology software",
      "theology app",
      "theology platform",
      "theology system",
      "theology management",
      "services theology"
  ],

  synonyms: [
      "Theology platform",
      "Theology software",
      "Theology system",
      "theology solution",
      "theology service"
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
      "Build a theology platform",
      "Create a theology app",
      "I need a theology management system",
      "Build a theology solution",
      "Create a theology booking system"
  ],
};
