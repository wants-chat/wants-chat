/**
 * Working Dog App Type Definition
 *
 * Complete definition for working dog applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKING_DOG_APP_TYPE: AppTypeDefinition = {
  id: 'working-dog',
  name: 'Working Dog',
  category: 'services',
  description: 'Working Dog platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "working dog",
      "working",
      "dog",
      "working software",
      "working app",
      "working platform",
      "working system",
      "working management",
      "services working"
  ],

  synonyms: [
      "Working Dog platform",
      "Working Dog software",
      "Working Dog system",
      "working solution",
      "working service"
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
      "Build a working dog platform",
      "Create a working dog app",
      "I need a working dog management system",
      "Build a working dog solution",
      "Create a working dog booking system"
  ],
};
