/**
 * Vector Art App Type Definition
 *
 * Complete definition for vector art applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VECTOR_ART_APP_TYPE: AppTypeDefinition = {
  id: 'vector-art',
  name: 'Vector Art',
  category: 'services',
  description: 'Vector Art platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "vector art",
      "vector",
      "art",
      "vector software",
      "vector app",
      "vector platform",
      "vector system",
      "vector management",
      "services vector"
  ],

  synonyms: [
      "Vector Art platform",
      "Vector Art software",
      "Vector Art system",
      "vector solution",
      "vector service"
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
      "Build a vector art platform",
      "Create a vector art app",
      "I need a vector art management system",
      "Build a vector art solution",
      "Create a vector art booking system"
  ],
};
