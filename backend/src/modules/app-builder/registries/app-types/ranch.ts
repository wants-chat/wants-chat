/**
 * Ranch App Type Definition
 *
 * Complete definition for ranch applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RANCH_APP_TYPE: AppTypeDefinition = {
  id: 'ranch',
  name: 'Ranch',
  category: 'services',
  description: 'Ranch platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ranch",
      "ranch software",
      "ranch app",
      "ranch platform",
      "ranch system",
      "ranch management",
      "services ranch"
  ],

  synonyms: [
      "Ranch platform",
      "Ranch software",
      "Ranch system",
      "ranch solution",
      "ranch service"
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
      "Build a ranch platform",
      "Create a ranch app",
      "I need a ranch management system",
      "Build a ranch solution",
      "Create a ranch booking system"
  ],
};
