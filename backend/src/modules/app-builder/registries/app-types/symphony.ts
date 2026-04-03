/**
 * Symphony App Type Definition
 *
 * Complete definition for symphony applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYMPHONY_APP_TYPE: AppTypeDefinition = {
  id: 'symphony',
  name: 'Symphony',
  category: 'services',
  description: 'Symphony platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "symphony",
      "symphony software",
      "symphony app",
      "symphony platform",
      "symphony system",
      "symphony management",
      "services symphony"
  ],

  synonyms: [
      "Symphony platform",
      "Symphony software",
      "Symphony system",
      "symphony solution",
      "symphony service"
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
      "Build a symphony platform",
      "Create a symphony app",
      "I need a symphony management system",
      "Build a symphony solution",
      "Create a symphony booking system"
  ],
};
