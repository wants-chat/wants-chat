/**
 * Wildlife Rehabilitation App Type Definition
 *
 * Complete definition for wildlife rehabilitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDLIFE_REHABILITATION_APP_TYPE: AppTypeDefinition = {
  id: 'wildlife-rehabilitation',
  name: 'Wildlife Rehabilitation',
  category: 'services',
  description: 'Wildlife Rehabilitation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wildlife rehabilitation",
      "wildlife",
      "rehabilitation",
      "wildlife software",
      "wildlife app",
      "wildlife platform",
      "wildlife system",
      "wildlife management",
      "services wildlife"
  ],

  synonyms: [
      "Wildlife Rehabilitation platform",
      "Wildlife Rehabilitation software",
      "Wildlife Rehabilitation system",
      "wildlife solution",
      "wildlife service"
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
      "Build a wildlife rehabilitation platform",
      "Create a wildlife rehabilitation app",
      "I need a wildlife rehabilitation management system",
      "Build a wildlife rehabilitation solution",
      "Create a wildlife rehabilitation booking system"
  ],
};
