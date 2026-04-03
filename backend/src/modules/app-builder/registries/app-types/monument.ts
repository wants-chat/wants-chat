/**
 * Monument App Type Definition
 *
 * Complete definition for monument applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MONUMENT_APP_TYPE: AppTypeDefinition = {
  id: 'monument',
  name: 'Monument',
  category: 'services',
  description: 'Monument platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "monument",
      "monument software",
      "monument app",
      "monument platform",
      "monument system",
      "monument management",
      "services monument"
  ],

  synonyms: [
      "Monument platform",
      "Monument software",
      "Monument system",
      "monument solution",
      "monument service"
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
      "Build a monument platform",
      "Create a monument app",
      "I need a monument management system",
      "Build a monument solution",
      "Create a monument booking system"
  ],
};
